import express  from "express"
import productsRouter from './routes/productsRouter.js'
import cartsRouter from './routes/cartsRouter.js'

const app = express()
const port = 8080

app.listen(port, console.log("servidor corriendo en el puerto: " + port))

//middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//routes
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)

