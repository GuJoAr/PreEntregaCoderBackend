import express from 'express'
import __dirname from './utils.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import productRouter from "./routes/productsRouter.js"
// import cartsRouter from './routes/cartsRouter.js'

const app = express()
const PORT = process.env.PORT || 8080

//Middlewares
app.set('views',__dirname+'/views')
app.set('view engine', 'handlebars')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(__dirname+'/public'))
app.engine('handlebars', handlebars.engine())


//Routes
app.use("/api/products", productRouter)
// app.use("/api/carts", cartsRouter)

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