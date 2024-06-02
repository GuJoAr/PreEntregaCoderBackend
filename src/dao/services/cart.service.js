import CartRepository from "../repositories/cart.repository.js"
import Ticket from "../models/ticket.model.js"
import CartDTO from "../DTO/cart.dto.js"
import { generateRandomCode } from "../../utils/utils.js"
import Purchase from "../models/purchase.model.js"
import logger from "../../utils/logger.js"

const cartService = {
    getCartById: async (cartId, userId) => {
        try {
            const cart = await CartRepository.getCartById(cartId, userId)
            let totalProducts = 0
            let totalPrice = 0
            cart.products.forEach(product => {
                totalProducts += product.productQuantity
                totalPrice += product.productTotal
            })
            cart.totalProducts = totalProducts
            cart.totalPrice = totalPrice
            return cart
        } catch (error) {
            throw new Error("Error al obtener el carrito por su ID: " + error.message)
            logger.error(`Error al obtener el carrito por su ID: ${cartId} para el user: ${userId} - ${error.message}`)
        }
    },

    addProductToCart: async (productId, userId) => {
        try {
            const user = await User.findById(userId)
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Producto no encontrado")
            }
            if (product.stock < 1) {
                throw new Error("Producto fuera de stock")
            }
            let cart = await Cart.findOne({ user: userId })
            if (cart) {
                const productIndex = cart.products.findIndex(p => p.product.toString() === productId)
                if (productIndex > -1) {
                    cart.products[productIndex].productQuantity += 1
                    cart.products[productIndex].productTotal += product.price
                } else {
                    cart.products.push({
                        product: productId,
                        productQuantity: 1,
                        productPrice: product.price,
                        productTotal: product.price,
                    })
                }
                cart.total += product.price
            } else {
                const cartItem = new Cart({
                    products: [{
                        product: productId,
                        productQuantity: 1,
                        productPrice: product.price,
                        productTotal: product.price,
                    }],
                    total: product.price,
                    user: userId,
                })
                cart = await cartItem.save()
            }
            const newCart = await cart.save()
            return newCart
        } catch (error) {
            logger.error(`Error al agregar el producto al carrito: ${error.message}`)
            throw new Error("Error al agregar producto al carrito: " + error.message)
        }
    },

    updateCart: async (cartId, products, total) => {
        try {
            const cart = await CartRepository.updateCart(cartId, products, total)
            return cart
        } catch (error) {
            logger.error(`Error al actualizar el carrito: ${error.message}`)
            throw new Error("Error al actualizar el carrito: " + error.message)
        }
    },

    updateProductQuantityInCart: async (cartId, productId, quantity) => {
        try {
            const cart = await CartRepository.updateProductQuantityInCart(cartId, productId, quantity)
            return cart
        } catch (error) {
            logger.error(`Error al actualizar la cantidad del producto:${error.message}`)
            throw new Error("Error al actualizar la cantidad del producto: " + error.message)
        }
    },

    purchaseCart: async (cartId, cartData) => {
        const { country, state, city, street, postal_code, phone, card_bank, security_number, userId } = cartData
        try {
            const cart = await CartRepository.getCartById(cartId, userId)
            let totalPurchaseAmount = 0
            const productsToPurchase = []
            const productsToKeepInCart = []
            for (const item of cart.products) {
                const product = await Product.findById(item.product)
                if (!product) {
                    throw new Error(`Producto con ID ${item.product} no encontrado`)
                }
                if (product.stock >= item.productQuantity) {
                    product.stock -= item.productQuantity
                    await product.save()
                    totalPurchaseAmount += item.productTotal
                    productsToPurchase.push(item)
                } else {
                    productsToKeepInCart.push(item)
                }
            }
            if (productsToPurchase.length === 0) {
                logger.warn(`No hay productos suficientes en stock para realizar la compra`)
                throw new Error("No hay productos suficientes en stock para realizar la compra")
            }
            const shippingDTO = new CartDTO(country, state, city, street, postal_code, phone)
            const paymentDTO = new CartDTO(card_bank, security_number)
            const purchase = new Purchase({
                user: userId,
                products: productsToPurchase.map(item => ({
                    product: item.product,
                    productQuantity: item.productQuantity,
                    productTotal: item.productTotal,
                })),
                shipping: shippingDTO,
                payment: paymentDTO,
            })
            const ticket = new Ticket({
                code: generateRandomCode(10),
                purchaseDatetime: new Date(),
                amount: totalPurchaseAmount,
                purchaser: userId,
                products: productsToPurchase.map(item => ({
                    id: item.product,
                    product: item.product.title,
                    productQuantity: item.productQuantity,
                    productTotal: item.productTotal,
                })),
            })
            await ticket.save()
            await purchase.save()
            await CartRepository.clearCart(cartId)
            await CartRepository.updateCart(cartId, productsToKeepInCart, totalPurchaseAmount)
            return ticket
        } catch (error) {
            throw new Error("Error al realizar la compra: " + error.message)
        }
    },

    getPurchaseCart: async () => {
        return "purchase"
    },

    deleteProductFromCart: async (cartId, productId) => {
        try {
            const cart = await CartRepository.deleteProductFromCart(cartId, productId)
            return cart
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    },

    clearCart: async (cartId) => {
        try {
            const cart = await CartRepository.clearCart(cartId)
            return cart
        } catch (error) {
            throw new Error("Error al vaciar el carrito: " + error.message)
        }
    }
}

export default cartService
