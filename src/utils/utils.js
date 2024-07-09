import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getProductsFilePath() {
    return path.join(__dirname, "../dao/data/productos.json")
}

export function getCartFilePath() {
    return path.join(__dirname, "../dao/data/carrito.json")
}

export default __dirname

export function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

export function configureProfileMulter() {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, 'public', 'profiles'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        },
    })
    return multer({ storage: storage })
}

export function configureProductMulter() {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, 'public', 'products'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        },
    })
    return multer({ storage: storage })
}

export function configureDocumentMulter() {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, 'public', 'documents'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        },
    })
    return multer({ storage: storage })
}

