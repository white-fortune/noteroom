import { Schema, model } from 'mongoose'

let requestSchema = new Schema({
    senderDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    receiverDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    message: {
        type: String,
        required: true
    }
})
let requestModel = model('requests', requestSchema)

export default requestModel 