import express from "express"
import cartRouter from "./routes/cartsRouter.js"
import productRouter from "./routes/productsRouter.js"
import messageRouter from "./routes/messageRouter.js"

const router = express.Router()

router.get("/", async(req, res) => {
    res.render("home")
})

router.use("/cart", cartRouter)
router.use("/products", productRouter)
router.use("/messages", messageRouter)

export default router