import productRepository from "../Repositories/product.repository.js"
import ProductDTO from "../DTO/product.dto.js"
import User from "../Models/user.model.js"

const productService = {
    getProducts: async (query, currentPage) => {
        try {
            const products = await productRepository.getAllProducts(query, currentPage)
            return products
        }
        catch (error) {
            throw new Error("Error al obtener los productos: " + error.message)
        }
    },

    getProductDetail: async (productId) => {
        try {
            const productDetail = await productRepository.getProductById(productId)
            return productDetail
        } catch (error) {
            throw new Error("Error al obtener el detalle del producto: " + error.message)
        }
    },

    getProductCategory: async (category, query, currentPage) => {
        try {
            const productCategory = await productRepository.getProductsByCategory(category, query, currentPage)
            return productCategory
        }
        catch (error) {
            throw new Error("Error al obtener los productos por categoria: " + error.message)
        }
    },

    addProduct: async (productData, req) => {
        const { title, brand, description, price, stock, category, userId } = productData
        try {
            const user = await User.findById(userId).exec()
            if (!user) {
                throw new Error("No es el administrador")
            }
            const imageName = req.file ? req.file.filename : null
            if (!imageName) {
                throw new Error('No se proporcionó una imagen válida')
            }
            const productDTO = new ProductDTO(title, brand, description, price, stock, category, imageName, userId)
            const newProduct = await productRepository.createProduct(productDTO)
            return newProduct
        } catch (error) {
            throw new Error("Error al guardar el producto: " + error.message)
        }
    },

    updateProduct: async (productId, req) => {
        const { title, brand, description, price, stock, category, userId } = req.body
        try {
            const existingProduct = await productRepository.getProductById(productId)
            if (!existingProduct) {
                throw new Error("El producto no existe")
            }
            const imageName = req.file ? req.file.filename : existingProduct.imageName
            const updateProductDTO = new ProductDTO(
                title || existingProduct.title,
                brand || existingProduct.brand,
                description || existingProduct.description,
                price !== undefined ? price : existingProduct.price,
                stock !== undefined ? stock : existingProduct.stock,
                category || existingProduct.category,
                imageName,
                userId || existingProduct.userId
            )
            const updatedProduct = await productRepository.updateProduct(productId, updateProductDTO)
            return updatedProduct
        } catch (error) {
            throw new Error("Error al actualizar el producto: " + error.message)
        }
    },

    getUpdateProduct: async () => {
        return "updateProduct"
    },

    deleteProduct: async (productId) => {
        try {
            const product = await productRepository.getProductById(productId)
            if (!product) {
                throw new Error("Producto no encontrado")
            }
            const deleteResult = await productRepository.deleteProductById(productId)
            if (!deleteResult) {
                throw new Error("Error al eliminar el producto")
            }
            return true
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    }
}

export default productService
