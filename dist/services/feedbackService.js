"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = getComments;
exports.addFeedback = addFeedback;
exports.getReply = getReply;
exports.addReply = addReply;
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const comments_js_1 = require("../schemas/comments.js");
const voteService_js_1 = require("./voteService.js");
async function getComments({ noteDocID, studentDocID }) {
    try {
        let feedbacks = await comments_js_1.feedbacksModel.find({ noteDocID: noteDocID }).populate('commenterDocID', 'displayname username studentID profile_pic').sort({ createdAt: -1 });
        let _extentedFeedbacks = await Promise.all(feedbacks.map(async (feedback) => {
            let isupvoted = await (0, voteService_js_1.isCommentUpVoted)({ feedbackDocID: feedback._id.toString(), voterStudentDocID: studentDocID });
            let reply = await comments_js_1.replyModel.find({ parentFeedbackDocID: feedback._id })
                .populate('commenterDocID', 'username displayname profile_pic studentID');
            return [{ ...feedback.toObject(), isUpVoted: isupvoted }, reply];
        }));
        return { ok: true, comments: _extentedFeedbacks };
    }
    catch (error) {
        return { ok: false };
    }
}
async function addFeedback(feedbackData) {
    try {
        await notes_js_1.default.findByIdAndUpdate(feedbackData.noteDocID, { $inc: { feedbackCount: 1 } });
        let feedback = await comments_js_1.feedbacksModel.create(feedbackData);
        let extendedFeedback = await comments_js_1.feedbacksModel.findById(feedback._id)
            .populate('commenterDocID', 'displayname username studentID profile_pic')
            .populate({
            path: 'noteDocID',
            select: 'ownerDocID title postType',
            populate: {
                path: 'ownerDocID',
                select: 'studentID username'
            }
        });
        return { ok: true, feedback: extendedFeedback };
    }
    catch (error) {
        return { ok: false };
    }
}
async function getReply(replyDocID) {
    let extentedReply = await comments_js_1.replyModel.findById(replyDocID)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate({
        path: 'parentFeedbackDocID',
        select: 'commenterDocID',
        populate: {
            path: 'commenterDocID',
            select: 'studentID username'
        }
    })
        .populate('noteDocID', 'title postType');
    return extentedReply;
}
async function addReply(replyData) {
    try {
        await notes_js_1.default.findByIdAndUpdate(replyData.noteDocID, { $inc: { feedbackCount: 1 } });
        await comments_js_1.feedbacksModel.findByIdAndUpdate(replyData.parentFeedbackDocID, { $inc: { replyCount: 1 } });
        let reply = await comments_js_1.replyModel.create(replyData);
        let extentedReply = await comments_js_1.replyModel.findById(reply._id)
            .populate('commenterDocID', 'displayname username studentID profile_pic')
            .populate({
            path: 'parentFeedbackDocID',
            select: 'commenterDocID',
            populate: {
                path: 'commenterDocID',
                select: 'studentID username'
            }
        })
            .populate('noteDocID', 'title postType');
        return { ok: true, reply: extentedReply };
    }
    catch (error) {
        return { ok: false };
    }
}
