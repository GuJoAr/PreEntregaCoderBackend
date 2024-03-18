import mongoose from "mongoose"
const { Schema } = mongoose

const collection = "Carts"

const schema = new Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId, ref: "products"
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
})

const cartsModel = mongoose.model(collection, schema)

export default cartsModel
