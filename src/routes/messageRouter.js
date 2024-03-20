import express from "express"
import messageController from "../dao/services/messageManager.js"

const messageRouter = express.Router()

messageRouter.get("/", messageController.getMessages)

messageRouter.post("/addMessage", messageController.addMessage)

export default messageRouter