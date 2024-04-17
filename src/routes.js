import express from "express"
import cartRouter from "./routes/cartsRouter.js"
import productRouter from "./routes/productsRouter.js"
import messageRouter from "./routes/messageRouter.js"
import userRouter from "./routes/userRouter.js"


const router = express.Router()

router.get("/", async(req, res) => {
    res.render("home")
})

router.use("/cart", cartRouter)
router.use("/products", productRouter)
router.use("/messages", messageRouter)
router.use("/users", userRouter)

export default router