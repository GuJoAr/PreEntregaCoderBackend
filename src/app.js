import express from 'express'
import __dirname from './utils.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import bodyParser from "body-parser"
import router from "./routes.js"
import session from "express-session"
import FileStore from "session-file-store"
import cookieParser from "cookie-parser"
import MongoStore from "connect-mongo"

const app = express()
const PORT = process.env.PORT || 8080
const fileStore = FileStore(session)

//Middlewares
app.set('views',__dirname+'/views')
app.set('view engine', 'handlebars')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(__dirname+'/public'))
app.engine('handlebars', handlebars.engine())
app.use(bodyParser.json())
app.use(cookieParser())

//Route
app.use("/api/", router)

app.use(session({
    store: MongoStore.create({
        mongoUrl: `mongodb://127.0.0.1:27017/ecommerce?retryWrites=true&w=majority`,
        ttl: 360,
    }),
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
}))

mongoose.connect(`mongodb://127.0.0.1:27017/ecommerce?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

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