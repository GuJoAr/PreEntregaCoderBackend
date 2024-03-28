import express from "express"
import productController from "../dao/services/productController.js";

const productRouter = express.Router();

// Ruta para renderizar la vista de productos en tiempo real
productRouter.get("/realtimeproducts", productController.getProducts);


// Maneja la solicitud de para ver los detalles del producto
productRouter.get("/:id", productController.getProductDetail);

// Manejar la solicitud de agregar un producto en tiempo real
productRouter.post("/addProduct", productController.addProduct);

// Manejar la solicitud de eliminación de un producto en tiempo real
productRouter.delete('/deleteProduct/:id', productController.deleteProduct);

export default productRouter;