import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../userService";
import { processBulkCompressUpload } from "../../helpers/utils";
import { addNote } from "../noteService";
import Notes from "../../schemas/notes";

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
                    const studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
                    const files = req.files
                    try {
                        const post = await addNote({
                            ownerDocID: studentDocID,
                            subject: postSubject,
                            title: postTitle,
                            description: postDescription
                        })
                        const postID = post._id.toString()
                        if (files) {
                            //FIXME: the bulk upload should happen asynchronously
                            const filePaths = await processBulkCompressUpload(files, postID)
                            if (filePaths) {
                                await Notes.updateOne({ _id: postID }, { $set: { content: filePaths, completed: true } })
                            } 
                            res.json({ ok: true })
                        } else {
                            await Notes.updateOne({ _id: postID }, { $set: { completed: true } })
                            res.json({ ok: true })
                        }
                    } catch (error) {
                        //TODO: the post should be deleted if the creatiion is failed
                        res.json({ ok: false, message: "Post couldn't be uploaded! Please try again a bit later or submit a report via support." })
                        console.log(error)
                    }
                }
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
