import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getProductsFilePath() {
    return path.join(__dirname, "./dao/data/productos.json")
}

export function getCartFilePath() {
    return path.join(__dirname, "./dao/data/carrito.json")
}

export default __dirname


dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const port = process.env.PORT
export const MONGO_URL = process.env.MONGO_URL
export const JWT_SECRET = process.env.JWT_SECRET
export const CLIENT_ID = process.env.CLIENT_ID
export const CLIENT_SECRET = process.env.CLIENT_SECRET
export const CALLBACK_URL = process.env.CALLBACK_URL

