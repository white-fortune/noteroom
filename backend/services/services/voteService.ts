import Votes, { CommentVotes } from "../../schemas/votes"
import Notes from "../../schemas/notes"
export async function isUpVoted({ noteDocID, voterStudentDocID }) {
    let upvote_doc = await Votes.findOne({ 
        $and: [ 
            { docType: { $ne: 'feedback' } }, 
            { noteDocID: noteDocID }, 
            { voterStudentDocID: voterStudentDocID } 
        ] })
    return upvote_doc ? true : false
}

export async function isCommentUpVoted({ feedbackDocID, voterStudentDocID }) {
    let upvote_doc = await CommentVotes.findOne({ 
        $and: [ 
            { docType: { $eq: 'feedback' } }, 
            { feedbackDocID: feedbackDocID }, 
            { voterStudentDocID: voterStudentDocID } 
        ] })
    return upvote_doc ? true : false
}


export async function deleteVote({ noteDocID, voterStudentDocID }) {
    try {
        let deleteResult = await Votes.deleteOne({ $and: [{ noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] })
        if (deleteResult.deletedCount !== 0) {
            await Notes.updateOne({ _id: noteDocID }, { $inc: { upvoteCount: -1 } })
        } 
        let upvoteCount = (await Notes.findOne({ _id: noteDocID }, { upvoteCount: 1 })).upvoteCount
        return { ok: true, upvoteCount }
    } catch (error) {
        return { ok: false }
    }
}

export async function addVote({ noteDocID, voterStudentDocID, voteType }) {
    let existingVoteData = await Votes.findOne({
        noteDocID: noteDocID,
        voterStudentDocID: voterStudentDocID,
        docType: { $ne: 'feedback' }
    })
    if (!existingVoteData) {
        let voteData = await Votes.create({noteDocID, voterStudentDocID, voteType})
        await Notes.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount : 1 } })
        let vote = await voteData.populate('noteDocID', 'title upvoteCount postType')
        return { ok: true, vote: vote }
    } else {
        return { ok: false }
    }
}