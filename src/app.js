import express from 'express'
import __dirname , { MONGO_URL, port } from './utils.js'
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
import cors from "cors"

const app = express()
const PORT = process.env.PORT || port
const fileStore = FileStore(session)
auth.initializePassport()

//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(__dirname+'/public'))
app.use(express.urlencoded({extended: true}))
app.engine('handlebars', handlebars.engine())
app.set('views',__dirname+'/views')
app.set('view engine', 'handlebars')

// Middleware de Passport 
app.use(passport.initialize())
app.use(passport.session())

//Route
app.use("/api/", router)

app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URL,
        ttl: 360,
    }),
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
}))

mongoose.connect(MONGO_URL)

const db = mongoose.connection

db.on("error", (error) => {
    console.error("No se pudo conectar a la DB:", error)
})

db.once("open", () => {
    console.log("Conectado con MongoDB")
})

const server = app.listen(PORT,()=>console.log("Servidor conectado al puerto: ", PORT))
const io = new Server(server)

io.on('connection', socket => {
    console.log("Nuevo cliente conectado!!")

    socket.on("deleteProduct", (deleteProductId) => {
        console.log("Producto borrado:", deleteProductId)
        io.emit("deleteProduct", deleteProductId)
    })

    socket.on("addProduct", (addProduct) => {
        console.log("Producto agregado:", addProduct)
        io.emit("addProduct", addProduct)
    })

    socket.on("addMessage", (addMessage) => {
        console.log("Mensaje agregado", addMessage)
        io.emit("addMessage", addMessage)
    })

    socket.on("deleteProductCart", (deleteProductCartId) => {
        console.log("Producto eliminado del carrito", deleteProductCartId)
        io.emit("deleteProductCart", deleteProductCartId)
    })

    socket.on("clearCart", (clearCart) => {
        console.log("Carrito vaciado:", clearCart)
        io.emit("clearCart", clearCart)
    })
})