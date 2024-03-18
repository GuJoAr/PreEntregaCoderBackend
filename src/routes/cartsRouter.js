import { Router } from "express"
import fs, { writeFileSync } from "fs"
import { randomUUID }  from "node:crypto"
import path from "path"
import __dirname from '../utils.js'

const cartsRouter = Router()
const pathCart = "../dao/data/carrito.json"

//rutas de carrito
cartsRouter.post("/", (req, res) => {
    // lee el contenido actual de carritos desde el archivo
    let cartData = fs.readFileSync(path.resolve(__dirname, pathCart), "utf-8")
    let parsedCart

    try {
        parsedCart = JSON.parse(cartData)
    } catch (error) {
        console.log("Error al parsear el archivo de carritos", error)
        return res.status(500).send("Error interno del servidor")
    }

    // genera un nuevo id para el carrito y crea un nuevo carrito
    const cartId = randomUUID()
    let newCart = {
        id: cartId,
        products: []
    }

    // agrega el nuevo carrito al array de carritos y escribe el array actualizado al json
    parsedCart.push(newCart)
    fs.writeFileSync(path.resolve(__dirname, pathCart), JSON.stringify(parsedCart), "utf-8")
    res.send(`Carrito creado con id: ${cartId}`)
})

cartsRouter.get("/:cid/", (req, res) => {

    // obtengo el id del carrito, leeo y analizo el archivo del carrito.
    let id = req.params.cid
    let carrito = fs.readFileSync(path.resolve(__dirname, pathCart), "utf-8")
    let parsedCart = JSON.parse(carrito)

    // Buscar el carrito con el ID proporcionado
    let finalCart = parsedCart.find((cart) => cart.id === id)

    // Verificar si se encontró el carrito
    if (!finalCart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }
    let data = JSON.stringify(finalCart)

    res.send(data)
})

cartsRouter.post("/:cid/product/:pid", (req,res) => {
    // leeo y parseao el contenido del archivo de productos
    let productsData = fs.readFileSync(path.resolve(__dirname, pathProducts), "utf-8")
    let products = JSON.parse(productsData)

    //parseo el json
    let cart = fs.readFileSync(pathCart, "utf-8")
    let parsedCart = JSON.parse(cart)

    //busco el producto
    let pid = req.params.pid
    let foundProduct = products.find((p) => p.id == pid)

    //busco el carrito
    let cid = req.params.cid
    let foundCart = parsedCart.findIndex((c) => c.id == cid)

    // pusheo el producto al carrito
    if (foundCart !== -1 && foundProduct) {
        parsedCart[foundCart].products.push(foundProduct)
        fs.writeFileSync(pathCart, JSON.stringify(parsedCart), "utf-8")
        res.send("producto agregado al carrito")
    } else {
        res.status(404).send("carrito o producto no encontrado")
    }
})

export default cartsRouter