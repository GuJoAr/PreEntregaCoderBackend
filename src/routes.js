import express from "express"
import cartRouter from "./routes/cartsRouter.js"
import productRouter from "./routes/productsRouter.js"
import messageRouter from "./routes/messageRouter.js"
import userRouter from "./routes/userRouter.js"


const router = express.Router()

router.get("/", async(req, res) => {
    res.render("home")
})

router.use("/api/cart", cartRouter)
router.use("/api/products", productRouter)
router.use("/api/messages", messageRouter)
router.use("/api/sessions", userRouter)

export default router