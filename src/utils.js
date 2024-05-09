import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getProductsFilePath() {
    return path.join(__dirname, "./dao/data/productos.json")
}

export function getCartFilePath() {
    return path.join(__dirname, "./dao/data/carrito.json")
}

export default __dirname

