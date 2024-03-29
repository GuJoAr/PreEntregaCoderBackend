import express from 'express'
import __dirname from './utils.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import router from "./routes.js"

const app = express()
const PORT = process.env.PORT || 8080

//Middlewares
app.set('views',__dirname+'/views')
app.set('view engine', 'handlebars')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(__dirname+'/public'))
app.engine('handlebars', handlebars.engine())
// app.use(bodyParser.json())

//Route
app.use("/api/", router)

const connectMongoDB = async () => {
    const DB_URL = 'mongodb://127.0.0.1:27017/ecommerce?retryWrites=true&w=majority'
    try{
        await mongoose.connect(DB_URL)
        console.log("Conectado con MongoDB")
    }catch(error){
        console.error("No se pudo conectar a la DB", error)
        process.exit()
    }
}
connectMongoDB()

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
})