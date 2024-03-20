import ProductManager from "../dao/services/productManager.js"
import express from "express"

const productManager = new ProductManager()
const productsRouter = express.Router()
// const pathProducts = "../dao/data/productos.json"

// ruta para obtener todos los productos
productsRouter.get("/all", (req, res) => {
    const limit = req.query.limit
    const products = productManager.getAll(limit)
    res.json(products)
})

// ruta para agregar un nuevo producto
productsRouter.post("/add", (req, res) => {
    const newProduct = req.body
    const result = productManager.addProduct(newProduct)
    res.json(result)
})

// ruta para obtener un producto por su ID
productsRouter.get("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid)
    const product = productManager.getProductById(productId)
    if (product) {
        res.json(product)
    } else {
        res.status(404).send("Producto no encontrado")
    }
})

// ruta para actualizar un producto por su ID
productsRouter.put("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid)
    const updatedProductData = req.body
    const result = productManager.updateProduct(productId, updatedProductData)
    res.json(result)
})

// ruta para eliminar un producto por su ID
productsRouter.delete("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid)
    const result = productManager.deleteProduct(productId)
    res.json(result)
})

export default productsRouter