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

import errorHandler from './middlewares/errors.js'

import Alerts from './schemas/alerts.js'

import noteIOHandler from './services/io/ioNoteService.js';
import notificationIOHandler from './services/io/ioNotifcationService.js';
import checkOnboarded from './middlewares/onBoardingChecker.js';
import blogsRouter from './routers/blogs.js';

import postApiRouter from './services/new_apis/post.js';
import feedApiRouter from './services/new_apis/feed.js';
import seacrhApiRouter from './services/new_apis/search.js';
import profileApiRouter from './services/new_apis/profile.js';
import notificationApiRouter from './services/new_apis/notifications.js';
import requestsApiRouter from './services/new_apis/requests.js';
import authApiRouter from './services/new_apis/auth.js';


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

const app = express()
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
const url = process.env.DEVELOPMENT === "true" ? "mongodb://localhost:27017/information" : process.env.MONGO_URI
if (process.env.DEVELOPMENT) {
    console.log('\x1b[36m%s\x1b[0m', `Feature flag: DEVELOPMENT (.env) = Enabled. Using local MongoDB.`)
}
connect(url).then(() => {
    console.log(`Connected to database information`);
})

const port = process.env.PORT

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', join(__dirname, '../views'))

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(_static(join(__dirname, '../public'))) // Middleware for using static files. All are stored in "/public" folder
app.use(urlencoded({
    extended: true
})) // Middleware for working with POST requests.
// app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: create({
        mongoUrl: url,
        ttl: 60 * 60 * 720
    }),
    cookie: {
        httpOnly: true,   // Prevents JavaScript access
        secure: false,    // Change to `true` in production with HTTPS
        maxAge: 1000 * 60 * 60 * 720
    }
}));

 // Middleware for working with sessions
app.use(cookieParser()) // Middleware for working with cookies
app.use(fileUpload()) // Middleware for working with files
// app.use('/login', loginRouter(io))
// app.use('/sign-up', signupRouter(io))
// app.use('/upload', checkOnboarded(false), uploadRouter(io))
// app.use('/view', noteViewRouter(io))
// app.use('/dashboard',checkOnboarded(false), dashboardRouter(io))
// app.use('/search-profile', serachProfileRouter(io))
// app.use('/auth', resetPasswordRouter())
// app.use('/settings', checkOnboarded(false), settingsRouter(io))
// app.use('/api', apiRouter(io))

app.use('/api/users', profileApiRouter(io))
app.use('/api/posts', postApiRouter(io))
app.use('/api/notifications', notificationApiRouter(io))
app.use('/api/requests', requestsApiRouter(io))

app.use('/api/feed', feedApiRouter(io))
app.use('/api/search', seacrhApiRouter(io))

app.use('/api/auth', authApiRouter(io))

app.use('/blog', blogsRouter())
app.use(errorHandler) // Middleware for handling errors

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
app.get('/onboarding', checkOnboarded(true))


export let userSocketMap: Map<string, string> = new Map()
io.on('connection', (socket) => {
    let studentID = <string>socket.handshake.query.studentID
    if (studentID) {
        userSocketMap.set(studentID, socket.id)
    }

    socket.on('disconnect', () => {
        userSocketMap.forEach((sockID, studentID) => {
            if (sockID === socket.id) {
                userSocketMap.delete(studentID)
            }
        })
    })

    notificationIOHandler(io, socket)
    noteIOHandler(io, socket)
})

app.get('/message', async (req, res) => {
    if (req.session && req.session["stdid"] == "1094a5ad-d519-4055-9e2b-0f0d9447da02") {
        if (req.query.message == undefined) {
            res.render('message')
        } else {
            let message = req.query.message
            let type = req.query.type

            await Alerts.create({ message: message, type: type })

            res.send({ url: '/dashboard' })
        }
    } else {
        res.status(404)
        res.render('404-error', { message: 'The page you are looking for is not found' })
    }
})

app.get('*', (req, res) => {
    res.status(404)
    res.render('404-error', { message: 'The page you are looking for is not found' })
}) // 404 if any url requested by the user is not found

server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})
