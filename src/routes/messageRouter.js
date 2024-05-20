import express from "express"
import messageController from "../dao/controllers/message.controller.js"
import { authToken, isUser } from "../config/auth.js"

const messageRouter = express.Router()

messageRouter.get("/", authToken, isUser, messageController.getMessages)

messageRouter.post("/addMessage", authToken, isUser, messageController.addMessage)

export default messageRouter
