import messagesModel from "../models/messages.model.js"

const messageRepository = {
    getMessages: async() => {
        try {
            const messages = await messagesModel.find().populate('user', 'email').lean()
            return messages
        }
        catch (error) {
            throw new Error("No se encontraron los mensajes, debido a un error de servidor:" + error.message)
        }
    },

    saveMessage: async (messageData) => {
        const message = new messagesModel(messageData)
        return await message.save()
    }
}

export default messageRepository