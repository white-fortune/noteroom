"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = postApiRouter;
const express_1 = require("express");
const noteService_1 = require("../noteService");
const userService_1 = require("../userService");
const feedbackService_1 = require("../feedbackService");
const voteService_1 = __importStar(require("../voteService"));
const router = (0, express_1.Router)();
function postApiRouter(io) {
    router.get("/:postID/metadata", async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            let response = await (0, noteService_1.getSingleNote)(req.params.postID, studentDocID, { images: false });
            if (response.ok) {
                res.json({ ok: true, noteData: response.noteData });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get("/:postID/images", async (req, res) => {
        try {
            let response = await (0, noteService_1.getSingleNote)(req.params.postID, null, { images: true });
            if (response.ok) {
                res.json({ ok: true, images: response.images });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get("/:postID/comments", async (req, res) => {
        try {
            let postID = req.params.postID;
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            let response = await (0, feedbackService_1.getComments)({ noteDocID: postID, studentDocID });
            if (response.ok) {
                res.json({ ok: true, comments: response.comments });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.put("/:postID/save", async (req, res) => {
        try {
            let postID = req.params.postID;
            let action = req.query["action"];
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            if (action === 'save') {
                let response = await (0, noteService_1.addSaveNote)({ studentDocID, noteDocID: postID });
                res.json({ ok: response.ok });
            }
            else {
                let response = await (0, noteService_1.deleteSavedNote)({ studentDocID, noteDocID: postID });
                res.json({ ok: response.ok });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.delete("/:postID/delete", async (req, res) => {
    });
    router.post("/:postID/feedbacks", async (req, res) => {
        try {
            const postID = req.params.postID;
            const studentID = req.session["stdid"];
            const feedbackContent = req.body.feedbackContent;
            const commenterDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            const feedbackData = {
                noteDocID: postID,
                commenterDocID: commenterDocID,
                feedbackContents: feedbackContent
            };
            const response = await (0, feedbackService_1.addFeedback)(feedbackData);
            console.log(response);
            if (response.ok) {
                res.json({ ok: true, feedback: response.feedback });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            console.error(error);
            res.json({ ok: false });
        }
    });
    router.post("/:postID/feedbacks/:feedbackID/replies", async (req, res) => {
        try {
            const postID = req.params.postID;
            const studentID = req.session["stdid"];
            const replyContent = req.body.replyContent;
            const parentFeedbackDocID = req.params.feedbackID;
            const replierDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            const replyData = {
                noteDocID: postID,
                feedbackContents: replyContent,
                commenterDocID: replierDocID,
                parentFeedbackDocID: parentFeedbackDocID
            };
            const response = await (0, feedbackService_1.addReply)(replyData);
            if (response.ok) {
                res.json({ ok: true, reply: response.reply });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: true });
        }
    });
    router.post("/:postID/vote", async (req, res) => {
        try {
            const postID = req.params.postID;
            const action = req.query["action"];
            const voterStudentID = req.session["stdid"];
            const voterStudentDocID = (await userService_1.Convert.getDocumentID_studentid(voterStudentID)).toString();
            const voteType = req.query["type"];
            if (!action) {
                let response = await (0, voteService_1.default)({ voteType, noteDocID: postID, voterStudentDocID: voterStudentDocID });
                res.json({ ok: response.ok });
            }
            else {
                let response = await (0, voteService_1.deleteVote)({ noteDocID: postID, voterStudentDocID });
                res.json({ ok: response.ok });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get("/saved", async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let response = await (0, noteService_1.getSavedPosts)(studentID);
            if (response.ok) {
                res.json({ ok: true, posts: response.posts });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return router;
}
