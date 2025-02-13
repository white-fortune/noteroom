import { Router } from 'express'
import Notes from '../schemas/notes.js'
import { upload } from '../services/firebaseService.js'
import { Server } from 'socket.io'
import { addNote, deleteNote } from '../services/noteService.js'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
import { INoteDB } from '../types/database.types.js'
import { compressImage, log } from '../helpers/utils.js'
import fileUpload from 'express-fileupload'
import { userSocketMap } from '../server.js'
import { NotificationSender } from '../services/io/ioNotifcationService.js'
import { Convert } from '../services/userService.js'
const router = Router()


function uploadRouter(io: Server) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let student = await profileInfo(req.session["stdid"])
            let savedNotes = await getSavedNotes(req.session["stdid"])
            let notis = await getNotifications(req.session["stdid"])
            let unReadCount = await unreadNotiCount(req.session["stdid"])
            res.render('upload-note', { root: student, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount })
        } else {
            res.redirect('/login')
        }
    })

    router.post('/', async (req, res, next) => {
        let studentID = req.session["stdid"]
        let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()

        if (!req.files) {
            res.send({ ok: false, message: 'No files have been selected to publish' })
        } else {
            let noteDocId: any;
            let noteTitle = req.body['noteTitle'] || "Untitled Note"

            try {
                let noteData: INoteDB = {
                    ownerDocID: studentDocID,
                    subject: req.body['noteSubject'],
                    title: req.body['noteTitle'],
                    description: req.body['noteDescription']
                } //* All the data except the notes posted by the client
                log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Got note data with title=${noteData.title}.`)

                res.send({ ok: true })

                let note = await addNote(noteData) //* Adding all the record of a note except the content links in the database
                noteDocId = note._id

                let fileObjects = <fileUpload.UploadedFile[]>Object.values(req.files) //* Getting all the file objects from the requests
                let compressedFileObjects = fileObjects.map(file => compressImage(file))
                let allFiles = await Promise.all(compressedFileObjects)
                log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Processed note images of noteDocID=${noteDocId || '--notedocid--'}.`)


                let allFilePaths = [] //* These are the raw file paths that will be directly used in the note-view

                for (const file of allFiles) {
                    let publicUrl = (await upload(file, `${studentDocID}/${noteDocId.toString()}/${file["name"]}`)).toString()
                    allFilePaths.push(publicUrl)
                }
                log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Uploaded note images of noteDocID=${noteDocId || '--notedocid--'}.`)

                await Notes.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths, completed: true } }) //* After adding everything into the note-db except content (image links), this will update the content field with the image links
                let completedNoteData = await Notes.findById(noteDocId)
                log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Completed note upload of noteDocID=${noteDocId || '--notedocid--'}.`)

                await NotificationSender(io, {
                    ownerStudentID: studentID,
                    redirectTo: `/view/${noteDocId}`
                }).sendNotification({
                    content: `Your note '${completedNoteData["title"]}' is successfully uploaded!`,
                    event: 'notification-note-upload-success'
                })

                let owner = await profileInfo(req.session["stdid"]) //* Getting the user information, basically the owner of the note
                io.emit('note-upload', { //* Handler 1: Dashboard; for adding the note at feed via websockets
                    noteID /* Document ID of the note */: noteDocId,
                    noteTitle /* Title of the note */: noteData.title,
                    description: noteData.description,
                    createdAt: note.createdAt,

                    content1: allFilePaths[0],
                    content2: allFilePaths[1],
                    contentCount /* The first image of the notes content as a thumbnail */: allFilePaths.length,
                    
                    ownerID /* Student ID of the owner of the note */: owner.studentID,
                    profile_pic /* Profile pic path of the owner of the note */: owner.profile_pic,
                    ownerDisplayName /* Displayname of the owener of the note*/: owner.displayname,
                    ownerUserName /* Username of the owner of the note */: owner.username,

                    isSaved: false,
                    isUpvoted: false,
                    feedbackCount: 0, 
                    upvoteCount: 0,

                    quickPost: false
                })
                log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Sent notification for successfull upload of noteDocID=${noteDocId || '--notedocid--'}.`)

            } catch (error) {
                log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error on upload note of noteDocID=${noteDocId || '--notedocid--'}: ${error.message}.`)
                await deleteNote({ studentDocID: studentDocID, noteDocID: noteDocId })
                await NotificationSender(io, {
                    ownerStudentID: studentID
                }).sendNotification({
                    content: `Your note '${noteTitle}' couldn't be uploaded successfully!`,
                    event: 'notification-note-upload-failure'
                })
            }
        }
    })

    return router
}

export default uploadRouter
