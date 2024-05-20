import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const entorno= {
    port: process.env.PORT,
    MONGO_URL : process.env.MONGO_URL,
    JWT_SECRET : process.env.JWT_SECRET,
    CLIENT_ID : process.env.CLIENT_ID,
    CLIENT_SECRET : process.env.CLIENT_SECRET,
    CALLBACK_URL : process.env.CALLBACK_URL,
    EMAIL_USERNAME : process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD : process.env.EMAIL_PASSWORD,
    TWILIO_SSID : process.env.TWILIO_SSID,
    AUTH_TOKEN : process.env.AUTH_TOKEN,
    PHONE_NUMBER : process.env.PHONE_NUMBER,
    PHONE_NUMBER_TO : process.env.PHONE_NUMBER_TO
}

