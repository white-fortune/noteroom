import express, { static as _static } from 'express'
import { join } from 'path'
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import cookieParser from 'cookie-parser'
import session from 'express-session'
import { connect } from 'mongoose'
import _pkg from 'body-parser';
const { urlencoded } = _pkg;
import fileUpload from 'express-fileupload'
import cors from 'cors'
import pkg from 'connect-mongo';
const { create } = pkg;

import postApiRouter from './services/apis/post.js';
import feedApiRouter from './services/apis/feed.js';
import seacrhApiRouter from './services/apis/search.js';
import profileApiRouter from './services/apis/profile.js';
import notificationApiRouter from './services/apis/notifications.js';
import requestsApiRouter from './services/apis/requests.js';
import authApiRouter from './services/apis/auth.js';
import uploadApiRouter from './services/apis/upload.js';

config({ path: join(__dirname, '.env') });

const app = express()
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
const url = process.env.DEVELOPMENT === "true" ? process.env.MONGO_URI_DEV : process.env.MONGO_URI

connect(url).then(() => {
    if (process.env.DEVELOPMENT) {
        console.log(`DEVELOPMENT flag enabled`)
        console.log(`[-] using local mongodb on ${url}`)
        console.log(`[-] using firebase development storage bucket: ${process.env.NOTEROOM_DEVELOPMENT_FIREBASE_BUCKET}`)
    } else {
        console.log(`[-] using remote mongodb on ${url}`)
        console.log(`[-] using firebase development storage bucket: ${process.env.NOTEROOM_PRODUCTION_FIREBASE_BUCKET}`)
    }
})

const port = process.env.PORT


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(urlencoded({
    extended: true
})) 
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: create({
        mongoUrl: url,
        ttl: 60 * 60 * 720
    }),
    cookie: {
        httpOnly: true,   
        secure: false,   
        maxAge: 1000 * 60 * 60 * 720
    }
}));

app.use(cookieParser()) 
app.use(fileUpload()) 

app.use('/api/users', profileApiRouter(io))
app.use('/api/posts', postApiRouter(io))
app.use('/api/notifications', notificationApiRouter(io))
app.use('/api/requests', requestsApiRouter(io))
app.use('/api/feed', feedApiRouter(io))
app.use('/api/search', seacrhApiRouter(io))
app.use('/api/auth', authApiRouter(io))
app.use('/api/upload', uploadApiRouter(io))

app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        res.clearCookie('studentID')
        res.clearCookie('recordID')
        res.clearCookie('username')
        res.clearCookie('connect.sid')
        if(!error) {
            res.redirect('/login')
        } else {
            res.redirect('/login')
        }
    })
})

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/support', (req, res) => {
    res.render('support')
})
app.get('/about-us', (req, res) => {
    res.render('about-us')
})
app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy')
})


export let userSocketMap: Map<string, string> = new Map()
io.on('connection', (socket) => {
    let studentID = <string>socket.handshake.query.studentID
    if (studentID) {
        userSocketMap.set(studentID, socket.id)
        io.to(socket.id).emit("hello", studentID)
    }

    socket.on('disconnect', () => {
        userSocketMap.forEach((sockID, studentID) => {
            if (sockID === socket.id) {
                userSocketMap.delete(studentID)
            }
        })
    })
})

server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})
