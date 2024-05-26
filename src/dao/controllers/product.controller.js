import productService from "../services/product.service.js"
import Cart from "../Models/carts.model.js"

const productController = {
    getProducts: async (req, res) => {
        const { category, brand, sort } = req.query
        let currentPage = req.query.page || 1
        const userId = req.session.userId
        const user = req.session.user
        const isAuthenticated = req.session.isAuthenticated
        const jwtToken = req.session.token
        const userRole = req.session.userRole
        try {
            const carts = await Cart.find({user: userId}).lean()
            const response = await productService.getProducts({ category, brand, sort }, currentPage)
            if (req.accepts('html')) {
                res.render('realTimeProducts', { response, Carts: carts, user, isAuthenticated, jwtToken, userRole })
            } else {
                res.json({ message: "Lista de productos:", response })
            }
        } catch (err) {
            console.error('Error:', err)
            return res.status(500).json({ error: "Error en la base de datos", details: err.message })
        }
    },

    getProductDetail: async (req, res) => {
        const productId = req.params.pid
        const user = req.session.user
        const isAuthenticated = req.session.isAuthenticated
        const jwtToken = req.session.token
        const userRole = req.session.userRole
        try {
            const productDetail = await productService.getProductDetail(productId)
            if (req.accepts('html')) {
                return res.render('product', { Product: productDetail, user, isAuthenticated, jwtToken, userRole })
            }
        } catch (err) {
            console.error("Error al ver los detalles:", err)
            return res.status(500).json({ error: "Error en la base de datos", details: err.message })
        }
    },

    getProductCategory: async (req, res) => {
        const category = req.params.category
        const { brand, sort } = req.query
        let currentPage = req.query.page || 1
        const user = req.session.user
        const isAuthenticated = req.session.isAuthenticated
        const jwtToken = req.session.token
        const userRole = req.session.userRole
        try {
            const response = await productService.getProductCategory(category, { brand, sort }, currentPage)
            if (req.accepts('html')) {
                res.render('category', { response, user, isAuthenticated, jwtToken, userRole })
            } else {
                res.json({ message: "Lista de productos por categoria:", response })
            }
        } catch (err) {
            console.error("Error al ver la categoria:", err)
            return res.status(500).json({ error: "Error en la base de datos", details: err.message })
        }
    },

    addProduct: async (req, res) => {
        const productData = req.body
        try {
            const newProduct = await productService.addProduct(productData, req)
            return res.json({
                message: "Producto creado!!!",
                Product: newProduct,
            })
        } catch (err) {
            console.error("Error al guardar el Producto:", err)
            return res.status(500).json({ error: "Error en la base de datos", details: err.message })
        }
    },

    updateProduct: async (req, res) => {
        const productId = req.params.pid
        try {
            const updatedProduct = await productService.updateProduct(productId, req)
            return res.json({ message: "Producto actualizado!", product: updatedProduct })
        } catch (err) {
            console.error('Error:', err)
            return res.status(500).json({ error: "Error en la base de datos", details: err.message })
        }
    },    

    getUpdateProduct: async (req, res) => {
        const productId = req.params.pid
        const user = req.session.user
        const isAuthenticated = req.session.isAuthenticated
        const jwtToken = req.session.token
        try {
            const product = await productService.getProductDetail(productId)
            const updateProductView = await productService.getUpdateProduct()
            res.render(updateProductView, { isAuthenticated, jwtToken, user, product })
        } catch (error) {
            console.error("Error al obtener la vista de editar el producto:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    deleteProduct: async (req, res) => {
        const productId = req.params.pid
        try {
            await productService.deleteProduct(productId)
            return res.json({ message: "Producto eliminado!" })
        } catch (err) {
            console.error('Error:', err)
            return res.status(500).json({ error: "Error en la base de datos", details: err.message })
        }
    }
}

export default productController