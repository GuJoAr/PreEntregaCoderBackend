import express from "express"
import messageController from "../dao/controllers/message.controller.js"

const messageRouter = express.Router()

messageRouter.get("/", messageController.getMessages)

messageRouter.post("/addMessage", messageController.addMessage)

export default messageRouter
