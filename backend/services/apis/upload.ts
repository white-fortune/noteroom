import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/userService";
import { addPost } from "../services/postService";
import { processBulkCompressUpload } from "../services/utils";
import Notes from "../../schemas/notes";
import logger from "../logger";

const router = Router() 

export default function uploadApiRouter(io: Server) {

    router.post("/", async (req, res) => {
        try {
            const studentID = req.session["stdid"]
            if (studentID) {
                const postSubject = req.body.postSubject
                const postTitle = req.body.postTitle
                const postDescription = req.body.postDescription

                if (!(postSubject && postTitle && postDescription)) {
                    res.json({ ok: false, message: "Please fill up all the information to publish." })
                    return
                } else {
                    logger.info(`(/upload): Got post data of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}`)
                    const studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
                    const files = req.files
                    try {
                        const post = await addPost({
                            ownerDocID: studentDocID,
                            subject: postSubject,
                            title: postTitle,
                            description: postDescription
                        })
                        const postID = post._id.toString()
                        logger.info(`(/upload): Saved post data of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}, postID=${postID}`)
                        if (files) {
                            //FIXME: the bulk upload should happen asynchronously
                            const filePaths = await processBulkCompressUpload(files, postID)
                            if (filePaths) {
                                logger.info(`(/upload): Compressed files of post and updated document of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}, postID=${postID}`)
                                await Notes.updateOne({ _id: postID }, { $set: { content: filePaths, completed: true } })
                            } 
                            res.json({ ok: true })
                        } else {
                            logger.info(`(/upload): Updated post document of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}, postID=${postID}`)
                            await Notes.updateOne({ _id: postID }, { $set: { completed: true } })
                            res.json({ ok: true })
                        }
                    } catch (error) {
                        //TODO: the post should be deleted if the creatiion is failed
                        logger.error(`(/upload): Failed to upload post of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}: ${error}`)
                        res.json({ ok: false, message: "Post couldn't be uploaded! Please try again a bit later or submit a report via support." })
                    }
                }
            }
        } catch (error) {
            logger.error(`(/upload): Failed to upload post of studentID=${req.session["stdid"] || '--studentID--'}: ${error}`)
            res.json({ ok: false })
        }
    })

    return router
}
