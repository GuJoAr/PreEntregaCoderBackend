// productsRouter.get("/", (req,res) => {
//     
//     const productosPath = path.resolve(__dirname, pathProducts)
//     fs.readFile(productosPath, "utf-8", (error, productosData) => {
//         if (error) {
//             console.log("error al leer el archivo productos.json", error)
//             return next(error)
//         }
//         // lo paso a formato json
//         const productos = JSON.parse(productosData)
//         // envio los productos como respuesta
//         res.json(productos)
//     })
// })

// productsRouter.get("/:pid/", (req,res) => {
//     // leo el contenido del archivo de productos
//     let productsData = fs.readFileSync(path.resolve(__dirname, pathProducts), "utf-8")
//     let products = JSON.parse(productsData)

//     // busco que el producto coincida con :pid
//     let pid = req.params.pid
//     let foundProduct = products.find((p) => p.id == pid)

//     // verifico si se encuentra el producto para enviarlo como respuesta sino envia un mjs de error
//     if (foundProduct) {
//         res.json(foundProduct)
//     } else {
//         res.status(404).send("Producto no encontrado")
//     }
// })

// productsRouter.post("/", (req,res) => {
//     let productosData = fs.readFileSync(path.resolve(__dirname, pathProducts), "utf-8")
//     let products = JSON.parse(productosData)
//     let newProduct = req.body

//     // verifico que todos los campos obligatorios esten presentes
//     let requiredFields = ["title", "description", "code", "price", "status", "stock", "category"]
//     let missingFields = requiredFields.filter(field => !newProduct[field])

//     if (missingFields.length > 0) {
//         return res.status(400).send(`Faltan campos obligatorios: ${missingFields.join(", ")}`)
//     }

//     // asigno un nuevo id al producto
//     let newProductId = Math.max(...products.map(p => p.id), 0) + 1
//     newProduct.id = newProductId

//     // agrego  y escribo el nuevo producto al array de productos
//     products.push(newProduct)
//     fs.writeFileSync(path.resolve(__dirname, pathProducts), JSON.stringify(products), "utf-8")

//     res.send(`Producto creado con ID: ${newProductId}`)
// })

// productsRouter.put("/:pid/", (req,res) => {
//     // cargo los productos del archivo antes de realizar la actualización
//     const productosData = fs.readFileSync(path.resolve(__dirname, pathProducts), "utf-8")
//     let products = JSON.parse(productosData)

//     // extraigo el ID del producto desde los parámetros de la solicitud y obtengo los datos actualizados del producto
//     const productId = parseInt(req.params.pid)
//     const updatedProductData = req.body

//     //uso find para buscar el indica de producto en el array productos
//     const productIndex = products.findIndex(product => product.id === productId)
//     if (productIndex === -1) {
//         return res.status(404).send(`Producto con ID ${productId} no encontrado`)
//     }

//     products[productIndex] = { ...products[productIndex], ...updatedProductData }

//     // escribo el array actualizado de productos en el archivo
//     fs.writeFileSync(path.resolve(__dirname, pathProducts), JSON.stringify(products), "utf-8")

//     res.send(`Producto con ID ${productId} actualizado`)
// })

// productsRouter.delete("/:pid/", (req,res) => {

//     const productId = parseInt(req.params.pid)

//     // cargo los productos antes de eliminarlo
//     const productosData = fs.readFileSync(path.resolve(__dirname, pathProducts), "utf-8")
//     let products = JSON.parse(productosData)

//     // busco el indice del producto en el array de productos y verifico si el producto existe
//     const productIndex = products.findIndex(product => product.id === productId)
//     if (productIndex === -1) {
//         return res.status(404).send(`Producto con ID ${productId} no encontrado`)
//     }

//     // elimino el producto del array y escribo el array actualizado en el json
//     products.splice(productIndex, 1)
//     fs.writeFileSync(path.resolve(__dirname, pathProducts), JSON.stringify(products), "utf-8")

//     res.send(`Producto con ID ${productId} eliminado`)
// })


import ProductManager from "../dao/services/productManager.js";
import express from "express";

const productManager = new ProductManager();
const productsRouter = express.Router();
// const pathProducts = "../dao/data/productos.json"

// ruta para obtener todos los productos
productsRouter.get("/all", (req, res) => {
    const limit = req.query.limit;
    const products = productManager.getAll(limit);
    res.json(products);
});

// ruta para agregar un nuevo producto
productsRouter.post("/add", (req, res) => {
    const newProduct = req.body;
    const result = productManager.addProduct(newProduct);
    res.json(result);
});

// ruta para obtener un producto por su ID
productsRouter.get("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = productManager.getProductById(productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send("Producto no encontrado");
    }
});

// ruta para actualizar un producto por su ID
productsRouter.put("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const updatedProductData = req.body;
    const result = productManager.updateProduct(productId, updatedProductData);
    res.json(result);
});

// ruta para eliminar un producto por su ID
productsRouter.delete("/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const result = productManager.deleteProduct(productId);
    res.json(result);
});

export default productsRouter