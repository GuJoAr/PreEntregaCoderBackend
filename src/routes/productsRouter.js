import express from "express"
import productController from "../dao/controllers/product.controller.js"
import { authToken, isAdmin } from "../config/auth.js"

const productRouter = express.Router()

// Ruta para renderizar la vista de productos en tiempo real
productRouter.get("/", productController.getProducts)

// Maneja la solicitud para ver los detalles del producto
productRouter.get("/:pid", productController.getProductDetail)

// Maneja la solicitud para ver las categorias de los productos
productRouter.get("/category/:category", productController.getProductCategory)

// Maneja la solicitud para renderizar el formulario para editar el producto
productRouter.get("/updateProduct/:pid", authToken, isAdmin, productController.getUpdateProduct)

// Manejar la solicitud para agregar un producto en tiempo real
productRouter.post("/", authToken, isAdmin, productController.addProduct)

// Maneja la solicitud para actualizar el producto
productRouter.put("/:pid", authToken, isAdmin, productController.updateProduct)

// Manejar la solicitud para la eliminación de un producto en tiempo real
productRouter.delete('/:pid', authToken, isAdmin, productController.deleteProduct)

export default productRouter
