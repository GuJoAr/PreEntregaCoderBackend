import Cart from "../Models/carts.model.js"

const CartRepository = {
    getCartById: async (cartId, userId) => {
        try {
            const cart = await Cart.findOne({ _id: cartId, user: userId })
                .populate('products.product')
                .populate({
                    path: 'user',
                    model: 'User'
                })
                .lean()
            if (!cart) {
                throw new Error("El carrito no existe para este usuario")
            }
            return cart
        } catch (error) {
            throw new Error("Error al obtener el ID del carrito: " + error.message)
        }
    },

    findByUserId: async (userId) => {
        try {
            const cart = await Cart.findOne({ user: userId })
            return cart
        }
        catch (error) {
            throw new Error("Error al obtener el carrito por ID: " + error.message)
        }
    },
    

    getCartByUser: async(userId) => {
        try {
            const cart = await Cart.find({user: userId}).lean()
            if(!cart) {
                throw new Error("Usted no es el creador de este carrito")
            }
            return cart
        } catch (error) {
            throw new Error("Error al obtener el carrito por userId: " + error.message)
        }
    },

    addProductToCart: async (productId, userId, cart, product) => {
        try {
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
            throw new Error("Error al agregar producto al carrito: " + error.message)
        }
    },

    createCart: async () => {
        try {
            const cart = new Cart({
                products: [],
                total: 0
            })
            await cart.save()
            return cart
        } catch (error) {
            throw new Error("Error al crear el carrito: " + error.message)
        }
    },

    updateCart: async (cartId, products, total) => {
        try {
            const cart = await Cart.findByIdAndUpdate(
                cartId,
                { products: products, total: total },
                { new: true }
            )
            return cart
        } catch (error) {
            throw new Error("Error al actualizar el carrito: " + error.message)
        }
    },

    updateProductQuantityInCart: async (cartId, productId, quantity) => {
        try {
            const cart = await Cart.findOneAndUpdate(
                { _id: cartId, "products.product": productId },
                { $inc: { "products.$.productQuantity": quantity } },
                { new: true }
            )
            return cart
        } catch (error) {
            throw new Error("Error al actualizar los productos del carrito: " + error.message)
        }
    },

    deleteProductFromCart: async (cartId, productId) => {
        try {
            const cart = await Cart.findOneAndUpdate(
                { _id: cartId },
                { $pull: { products: { product: productId } } },
                { new: true }
            )
            return cart
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    },

    clearCart: async (cartId) => {
        try {
            const cart = await Cart.findByIdAndUpdate(
                cartId,
                { products: [], total: 0 },
                { new: true }
            )
            return cart
        } catch (error) {
            throw new Error("Error al vaciar el carrito: " + error.message)
        }
    }
}

export default CartRepository
