const express = require('express')
const Notes = require('../schemas/notes')
const Students = require('../schemas/students')
const path = require('path')
const fs = require('fs').promises //! Testing pusposes, will be deleted soon
const router = express.Router()

function uploadRouter(io) {
    async function addNote(noteObj) {
        let note = await Notes.create(noteObj)
        await Students.findByIdAndUpdate(
            noteObj.ownerid, 
            { $push: { owned_notes: note._id } }, 
            { upsert: true, new: true }
        )
        return note
    }

    router.get('/', (req, res) => {
        if(req.session.stdid) {
            res.render('upload-note')
        } else {
            res.redirect('/login')
        }
    })

    router.post('/', async (req, res, next) => {
        /* 
        POST Handler:
        =============
            1. First the text data (subject, title and description) and the File Objects will be captured
            2. Add the text data into the database so that we can get the note's document ID
            3. Grab the note's document ID and then create a new folder with that within the student's folder (owner's folder)
            4. Save all the files into the cloud (into the note folder) and fetch their links
            5. Update the note's record by adding all the image-links into the database
         */
        //! All the fs.* you will see are for testing purposes. I have just created a local firebase folder that will mimic the task of firebase. This will be removed when I will work with the cloud management
        if(!req.files) {
            res.send({ error: 'No files have been selected to publish' })
        } else {
            let noteData = {
                ownerid: req.cookies['recordID'],
                subject: req.body['noteSubject'],
                title: req.body['noteTitle'],
                description: req.body['noteDescription']
            } //* All the data except the notes posted by the client
            let note = await addNote(noteData) //* Adding all the record of a note except the content links in the database
            let noteDocId = note._id
            let savePath = path.join(__dirname, `../../public/firebase/${req.cookies['recordID']}/${noteDocId}`) //* This is the main file path of the local cloud
            fs.mkdir(savePath, { recursive: true }) //* Every time a new note is created, a new note-dir will be created named after its doc-id

            let allFiles = Object.values(req.files) //* Getting all the file objects from the requests
    
            let allPromises = [] //* All the save-file-into-firebase promises wil be added
            let allFilePaths = [] //* These are the raw file paths that will be directly used in the note-view
            for(const file of allFiles) {
                allFilePaths.push(path.join(`firebase/${req.cookies['recordID']}/${noteDocId}`, file.name)) 
                 //* The truncated version of the image file paths so that it can be used directly to the note-view
                allPromises.push(file.mv(`${savePath}/${file.name}`))
            } //! For now saving into the local folder. Will do that in the cloud
    
            Promise.all(allPromises).then(() => {
                console.log(`All done`)
            }).catch(error => {
                console.log(error.message)
                next(error)
            })

            Notes.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths } }).then(() => {
                res.send({ url: '/view' })
            }) //* After adding everything into the note-db except content (image links), this will update the content field with the image links
            
            console.log(noteData)
        }
    })

    return router
}

module.exports = uploadRouter