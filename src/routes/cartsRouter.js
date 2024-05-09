import express from "express";
import cartController from "../dao/controllers/cart.controller.js";
import { authToken } from "../config/auth.js";

const cartRouter = express.Router();

// Maneja la solicitud de renderizar el carrito
cartRouter.get("/:cid", authToken, cartController.getCartById);

// Maneja la solicitud para comprar productos
cartRouter.post("/products/buy", authToken, cartController.buyCart);

// Maneja la solicitud de agregar el producto al carrito
cartRouter.post("/add", authToken, cartController.addProductToCart);

cartRouter.put("/:cid/products/:pid", authToken, cartController.updateProductQuantityInCart);

cartRouter.delete("/:cid/products/:pid", authToken, cartController.deleteProductFromCart);

cartRouter.delete("/:cid", authToken, cartController.clearCart);

export default cartRouter;