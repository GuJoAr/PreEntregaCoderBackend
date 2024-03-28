import express from "express";
import cartController from "../dao/services/cartController.js";

const cartRouter = express.Router();

// Maneja la solicitud de renderizar el carrito
cartRouter.get("/:cid", cartController.getCartById);

// Maneja la solicitud para comprar productos
cartRouter.post("/products/buy", cartController.buyCart);

// Maneja la solicitud de agregar el producto al carrito
cartRouter.post("/add", cartController.addProductToCart);

cartRouter.put("/:cid/products/:pid", cartController.updateProductQuantityInCart);

cartRouter.delete("/:cid/products/:pid", cartController.deleteProductFromCart);

cartRouter.delete("/:cid", cartController.clearCart);

export default cartRouter;