import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import { entorno } from "../src/config/config.js"

const requester = supertest("http://localhost:8080")

let authToken
let userId
let productId
let cartId

const userCredentials = {
    email: 'prueba01@prueba02.com',
    password: '123456'
}

before(async function () {
    await mongoose.connect(entorno.MONGO_URL)
    const loginResponse = await requester.post("/api/sessions/login").send(userCredentials)
    expect(loginResponse.statusCode).to.equal(200)
    console.log("Login exitoso:", loginResponse.body)
    authToken = loginResponse.body.access_token
    userId = loginResponse.body.message._id
})

describe("Pruebas para el carrito", function () {
    it("Debería obtener la lista de productos y seleccionar el primer producto", async function () {
        try {
            const productsListResponse = await requester.get("/api/products/");
            expect(productsListResponse.statusCode).to.equal(200);
            console.log("Lista de los productos:", productsListResponse.body);
            const productsList = productsListResponse.body;
            // Selecciona el primer producto de la lista
            const firstProduct = productsList[0];
            productId = firstProduct._id;
            console.log("Producto seleccionado:", productId);
        } catch (error) {
            console.error("Error durante la solicitud al endpoint:", error);
            throw error;
        }
    });

    it("El endpoint /api/carts/ debe agregar el producto al carrito", async function () {
        try {
            const cartMock = {
                product: productId,
                user: userId
            }
            const addProductToCartResponse = await requester
                .post("/api/carts/")
                .set('Authorization', `Bearer ${authToken}`)
                .send(cartMock)
            expect(addProductToCartResponse.statusCode).to.equal(201)
            console.log("Carrito:", addProductToCartResponse.body)
            // guarda el ID del carrito para su uso posterior
            cartId = addProductToCartResponse.body._id 
        } catch (error) {
            console.error("Error durante la solicitud al endpoint:", error)
            throw error
        }
    })

    it("El endpoint /api/carts/:cid debe eliminar el carrito", async function () {
        try {
            const deleteCartResponse = await requester
                .delete(`/api/carts/${cartId}`)
                .set('Authorization', `Bearer ${authToken}`)
            expect(deleteCartResponse.statusCode).to.equal(200)
            console.log("Carrito borrado")
        } catch (error) {
            console.error("Error durante la solicitud al endpoint:", error)
            throw error
        }
    })
})

after(async function () {
    await mongoose.disconnect()
})
