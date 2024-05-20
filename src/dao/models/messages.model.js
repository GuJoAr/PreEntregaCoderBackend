import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String,
})

const messagesModel = mongoose.model("Message", messageSchema)

export default messagesModel
