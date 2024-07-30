import express from 'express'
import __dirname from './utils/utils.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import bodyParser from "body-parser"
import router from "./routes.js"
import session from "express-session"
import FileStore from "session-file-store"
import cookieParser from "cookie-parser"
import MongoStore from "connect-mongo"
import auth from "./config/auth.js"
import passport from "./config/jwt.js"
import { entorno } from './config/config.js'
import cors from "cors"
import nodemailer from "nodemailer"
import compression from "express-compression"
import { fakerES as faker } from "@faker-js/faker"
import errorHandler from "./errors/errorHandler.js"
import { addLogger } from "./utils/logger-env.js"
import logger from "./utils/logger.js"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUiExpress from "swagger-ui-express"


// Nodemailer
const dataTransport = {
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    port: 587,
    auth: {
        user: entorno.EMAIL_USERNAME,
        pass: entorno.EMAIL_PASSWORD
    }
}
export const transport = nodemailer.createTransport(dataTransport)
const app = express()
const PORT = entorno.port||9090
const fileStore = FileStore(session)

//Middlewares
auth.initializePassport()
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(__dirname+'/public'))
app.use(express.urlencoded({extended: true}))
app.engine('handlebars', handlebars.engine())
app.set('views',__dirname+'/views')
app.set('view engine', 'handlebars')
app.use(compression({
    brotli: {enable: true}
}))
// Middleware de errores
app.use(errorHandler)

app.use(session({
    store: MongoStore.create({
        mongoUrl: entorno.MONGO_URL,
        ttl: 3600,
    }),
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
}))

mongoose.connect(entorno.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.on("error", (error) => {
    logger.error("No se pudo conectar a la DB:", error)
})

db.once("open", () => {
    logger.info("Conectado con MongoDB")
})

// Middleware de Passport 
app.use(passport.initialize())
app.use(passport.session())
app.use(addLogger)

//Route
app.use("/", router)

// funcion que genera los productos simulados
const generateMockProducts = () => {
    const products = [];
    for (let i = 0; i < 100; i++) {
        products.push({
            _id: new mongoose.Types.ObjectId(),
            title: faker.commerce.productName(),
            brand: faker.company.name(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price(),
            stock: faker.random.numeric(2),
            category: faker.commerce.department(),
            image: faker.image.imageUrl()
        });
    }
    return products
}

// endpoint que devuelve productos simulados
app.get("/mockingproducts", (req, res) => {
    const products = generateMockProducts()
    res.json(products)
})

// endpoint para los logs
app.get("/loggerTest", (req, res) => {
    try {
        logger.fatal("Mensaje de error fatal")
        logger.error("Mensaje de error")
        logger.warn("Mensaje de error de advertencia")
        logger.info("Mensaje de error de informacion")
        logger.http("Mensaje de error de http")
        logger.debug("Mensaje de error de depuracion")
        res.status(200).send("Logs son correctos")
    } catch (error) {
        logger.error("Error en los logs:", error)
        res.status(500).send("Error en los logs")
    }
})

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion de la entrega final",
            description: "entrega final"
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJSDoc(swaggerOptions)
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

const server = app.listen(PORT,()=>logger.info(`Servidor conectado al puerto: ${PORT}`))
const io = new Server(server)

io.on('connection', socket => {
    logger.info("Nuevo cliente conectado!!")

    socket.on("deleteProduct", (deleteProductId) => {
        logger.warning("Producto borrado:", deleteProductId)
        io.emit("deleteProduct", deleteProductId)
    })

    socket.on("addProduct", (addProduct) => {
        logger.info("Producto agregado:", addProduct)
        io.emit("addProduct", addProduct)
    })

    socket.on("addMessage", (addMessage) => {
        logger.info("Mensaje agregado", addMessage)
        io.emit("addMessage", addMessage)
    })

    socket.on("deleteProductCart", (deleteProductCartId) => {
        logger.warning("Producto eliminado del carrito", deleteProductCartId)
        io.emit("deleteProductCart", deleteProductCartId)
    })

    socket.on("clearCart", (clearCart) => {
        logger.debug("Carrito vaciado:", clearCart)
        io.emit("clearCart", clearCart)
    })
})