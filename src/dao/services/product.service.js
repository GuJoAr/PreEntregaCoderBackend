import productRepository from "../repositories/product.repository.js"
import userRepository from "../repositories/user.repository.js"
import ProductDTO from "../DTO/product.dto.js"
import logger from "../../utils/logger.js"

const productService = {
    getProducts: async (query, currentPage) => {
        try {
            const products = await productRepository.getAllProducts(query, currentPage)
            logger.info(`Productos encontrados: ${JSON.stringify(products)}`)
            return products
        }
        catch (error) {
            logger.error(`Error al encontrar los productos - ${error.message}`)
            throw new Error("Error al obtener los productos: " + error.message)
        }
    },

    getProductDetail: async (productId) => {
        try {
            logger.info(`Buscando producto por su ID: ${productId}`)
            const productDetail = await productRepository.getProductById(productId)
            if (!productDetail) {
                logger.warn(`Producto no encontrado por su ID: ${productId}`)
                throw new Error("Error al obtener el detalle del producto: " + error.message)
            }
            logger.info(`Producto encontrado exitosamente: ${JSON.stringify(productDetail)}`)
            return productDetail
        } catch (error) {
            logger.error(`Error al encontrar el producto ID: ${productId} - ${error.message}`)
            throw new Error("Error al obtener el detalle del producto: " + error.message)
        }
    },

    getProductCategory: async (category, query, currentPage) => {
        try {
            const productCategory = await productRepository.getProductsByCategory(category, query, currentPage)
            logger.info(`Productos de la categoria encontrados exitosamente: ${category}`)
            return productCategory
        } catch (error) {
            logger.error(`Error al buscar los productos por su categoria: ${category} - ${error.message}`)
            throw new Error("Error al obtener los productos por categoria: " + error.message)
        }
    },

    addProduct: async (productData, req) => {
        const { title, brand, description, price, stock, category, userId } = productData
        try {
            logger.info(`Agregando los datos del producto: ${JSON.stringify(productData)}`)
            const user = await userRepository.findById(userId)
            if (!user) {
                logger.warn(`Usuario no encontrado: ${userId}`)
                throw new Error("Usuario no encontrado")
            }
            const imageName = req.file ? req.file.filename : null
            if (!imageName) {
                logger.warn(`Imagen invalida para el producto: ${title}`)
                throw new Error("Imagen no encontrada")
            }
            const productDTO = new ProductDTO(title, brand, description, price, stock, category, imageName, userId)
            const newProduct = await productRepository.createProduct(productDTO)
            logger.info(`Producto agregado exitosamente: ${JSON.stringify(newProduct)}`)
            return newProduct
        } catch (error) {
            logger.error(`Error al agregar el producto - ${error.message}`)
            throw new Error("Error al agregar el producto: " + error.message)
        }
    },

    updateProduct: async (productId, req, updateData, userId, user, userRole, product) => {
        const { title, brand, description, price, stock, category } = productUpdateData
        try {
            logger.info(`Actualizando el producto ID: ${productId} with data: ${JSON.stringify(productUpdateData)}`)
            const existingProduct = await productRepository.getProductById(productId)
            if (!existingProduct) {
                logger.warn(`Producto no encontrado ID: ${productId}`)
                throw new Error("El producto no existe")
            }
            if ((userRole === 'admin' || (userRole === 'premium' && user && user._id.toString() === product.owner._id.toString()))) {
                logger.warn("Usted no está autorizado")
                throw new Error("No tiene los permisos requeridos")
            }
            if (req.file) {
                updateData.imageName = req.file.filename
            }
            if (updateData.price < 0 || updateData.stock < 0) {
                logger.warn("El precio y/o stock deben de ser de valores positivos")
                throw new Error (`Error al actualizar el producto ID: ${productId} - ${error.message}`)
            }
            const updatedProduct = await productRepository.updateProduct(productId, updateData)
            logger.info(`Producto actualizado exitosamente: ${JSON.stringify(updatedProduct)}`)
            return updatedProduct
        } catch (error) {
            logger.error(`Error al actualizar el producto ID: ${productId} - ${error.message}`)
            throw new Error("Error al actualizar el producto: " + error.message)
        }
    },    

    getUpdateProduct: async () => {
        return "updateProduct"
    },

    deleteProduct: async (productId) => {
        try {
            logger.info(`Borrando el producto ID: ${productId}`)
            const product = await productRepository.getProductById(productId)
            if (!product) {
                logger.warn(`Producto no encontrado ID: ${productId}`)
                throw new Error("Producto no encontrado")
            }
            const deleteResult = await productRepository.deleteProductById(productId)
            if (!deleteResult) {
                logger.error(`No se pudo eliminar el producto ID: ${productId}`)
                throw new Error("Error al eliminar el producto")
            }
            logger.info(`Producto eliminado exitosamente: ${productId}`)
            return true
        } catch (error) {
            logger.error(`Error al borrar el producto ID: ${productId} - ${error.message}`)
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    }
}

export default productService
