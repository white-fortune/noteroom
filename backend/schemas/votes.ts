import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'votes'
}

const votesSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "notes"
    },
    voterStudentDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "students"
    },
    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        default: "upvote"
    }
}, baseOptions)
const votesModel = model('votes', votesSchema)


const commenteVotesSchema = new Schema({
    feedbackDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'comments'
    }
})
const commentVotesModel = votesModel.discriminator('feedback', commenteVotesSchema)


export default votesModel
export const CommentVotes = commentVotesModel
