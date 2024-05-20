import Product from "../Models/products.model.js"

const productRepository = {
    getAllProducts: async (query, currentPage) => {
        try {
            const options = {
                limit: 10,
                page: currentPage,
                sort: { price: query.sort === 'asc' ? 1 : -1 }
            }
            let dbQuery = {}
            if (query.category) {
                dbQuery.category = query.category
            }
            if (query.brand) {
                dbQuery.brand = query.brand
            }
            const filter = await Product.paginate(dbQuery, options)
            const products = filter.docs.map(product => product.toObject())
            let prevLink = null
            if (filter.hasPrevPage) {
                prevLink = `http://localhost:8080/api/products?page=${filter.prevPage}`
            }
            let nextLink = null
            if (filter.hasNextPage) {
                nextLink = `http://localhost:8080/api/products?page=${filter.nextPage}`
            }
            const response = {
                status: 'success',
                Products: products,
                query: {
                    totalDocs: filter.totalDocs,
                    limit: filter.limit,
                    totalPages: filter.totalPages,
                    page: filter.page,
                    pagingCounter: filter.pagingCounter,
                    hasPrevPage: filter.hasPrevPage,
                    hasNextPage: filter.hasNextPage,
                    prevPage: filter.prevPage,
                    nextPage: filter.nextPage,
                    prevLink: prevLink,
                    nextLink: nextLink
                },
            }
            return response
        } catch (error) {
            throw new Error("Error al obtener los productos: " + error.message)
        }
    },

    getProductById: async (productId) => {
        try {
            const product = await Product.findById(productId).populate('user').lean()
            return product
        } catch (error) {
            throw new Error("Error al obtener el producto por su ID: " + error.message)
        }
    },

    getProductsByCategory: async (category, query, currentPage) => {
        try {
            const options = {
                page: currentPage,
                limit: 10,
                sort: { price: query.sort === 'asc' ? 1 : -1 }
            }
            let dbQuery = { category }
            if (query.brand) {
                dbQuery.brand = query.brand
            }
            const filter = await Product.paginate(dbQuery, options)
            const filterDoc = filter.docs.map(product => product.toObject())
            let prevLink = null
            if (filter.hasPrevPage) {
                prevLink = `http://localhost:8080/api/products/${category}?page=${filter.prevPage}`
            }
            let nextLink = null
            if (filter.hasNextPage) {
                nextLink = `http://localhost:8080/api/products/${category}?page=${filter.nextPage}`
            }
            const response = {
                status: 'success',
                Category: filterDoc,
                query: {
                    totalDocs: filter.totalDocs,
                    limit: filter.limit,
                    totalPages: filter.totalPages,
                    page: filter.page,
                    pagingCounter: filter.pagingCounter,
                    hasPrevPage: filter.hasPrevPage,
                    hasNextPage: filter.hasNextPage,
                    prevPage: filter.prevPage,
                    nextPage: filter.nextPage,
                    prevLink: prevLink,
                    nextLink: nextLink
                },
            }
            return response
        } catch (error) {
            throw new Error("Error al obtener los productos de la categoría: " + error.message)
        }
    },

    createProduct: async (productData) => {
        try {
            const newProduct = new Product(productData)
            await newProduct.save()
            return newProduct
        } catch (error) {
            throw new Error("Error al crear un nuevo producto: " + error.message)
        }
    },

    updateProduct: async (productId, updatedProductData) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(productId, { $set: updatedProductData }, { new: true })
            return updatedProduct
        } catch (error) {
            throw new Error("Error al actualizar el producto: " + error.message)
        }
    },    

    deleteProductById: async (productId) => {
        try {
            const deleteResult = await Product.deleteOne({ _id: productId })
            if (deleteResult.deletedCount === 0) {
                throw new Error("Producto no encontrado")
            }
            return true
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    }
}

export default productRepository
