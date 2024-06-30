import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import { entorno } from "../src/config/config.js"
import Product from "../src/dao/models/products.model.js"
import __dirname from "../src/utils/utils.js"

const requester = supertest("http://localhost:8080")

let authToken
let userId
let productId

const userCredentials = {
    email: 'prueba01@prueba02.com',
    password: '123456'
}

const productMock = {
    title: 'Test Product',
    brand: 'Example Brand',
    description: 'This is an example product',
    price: 1000,
    stock: 10,
    category: "tecnologia",
    owner: null,
}

before(async function () {
    await mongoose.connect(entorno.MONGO_URL)
    const loginResponse = await requester.post("/api/sessions/login").send(userCredentials)
    expect(loginResponse.statusCode).to.equal(200)
    console.log("Login exitoso:", loginResponse._body)
    authToken = loginResponse.body.access_token
    userId = loginResponse.body.message._id
})

describe("prueba para los productos", function () {
    beforeEach(async function () {
        productMock.owner = userId
        try {
            const existingProduct = await Product.findOne({ title: productMock.title })
            if (existingProduct) {
                productId = existingProduct._id
                console.log("El producto ya existe:", existingProduct)
            } else {
                const createProductResponse = await requester
                    .post("/api/products/")
                    .set('Authorization', `Bearer ${authToken}`)
                    .field('title', productMock.title)
                    .field('brand', productMock.brand)
                    .field('description', productMock.description)
                    .field('price', productMock.price)
                    .field('stock', productMock.stock)
                    .field('category', productMock.category)
                    .field('owner', productMock.owner)
                expect(createProductResponse.statusCode).to.equal(200)
                console.log("Producto creado:", createProductResponse.body)
                productId = createProductResponse.body.Product._id
            }
        } catch (error) {
            console.error("Error durante la preparación del producto:", error)
            throw error
        }
    })

    describe("para ver los productos", () => {
        it("El endpoint /api/products/ debe mostrar la lista de productos", async function () {
            try {
                const productsList = await requester.get("/api/products/")
                expect(productsList.statusCode).to.equal(200)
                console.log("Lista de los productos:", productsList.text)
            } catch (error) {
                console.error("Error en la búsqueda de los productos:", error)
                throw error
            }
        })
    })

    describe("muestra el producto creado", () => {
        it("El endpoint /api/products/:pid debe mostrar el producto creado", async function () {
            try {
                const productCreatedResponse = await requester
                    .get(`/api/products/${productId}`)
                expect(productCreatedResponse.statusCode).to.equal(200)
                console.log("Producto que se ha creado:", productCreatedResponse.text)
            } catch (error) {
                console.error("Error durante la solicitud al endpoint de eliminación:", error)
                throw error
            }
        })
    })
})

after(async function () {
    await Product.deleteMany({ title: productMock.title })
    await mongoose.disconnect()
})
