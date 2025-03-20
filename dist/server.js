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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketMap = void 0;
const express_1 = __importStar(require("express"));
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const mongoose_1 = require("mongoose");
const body_parser_1 = __importDefault(require("body-parser"));
const { urlencoded } = body_parser_1.default;
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const { create } = connect_mongo_1.default;
const errors_js_1 = __importDefault(require("./middlewares/errors.js"));
const alerts_js_1 = __importDefault(require("./schemas/alerts.js"));
const ioNoteService_js_1 = __importDefault(require("./services/io/ioNoteService.js"));
const ioNotifcationService_js_1 = __importDefault(require("./services/io/ioNotifcationService.js"));
const onBoardingChecker_js_1 = __importDefault(require("./middlewares/onBoardingChecker.js"));
const blogs_js_1 = __importDefault(require("./routers/blogs.js"));
const post_js_1 = __importDefault(require("./services/new_apis/post.js"));
const feed_js_1 = __importDefault(require("./services/new_apis/feed.js"));
const search_js_1 = __importDefault(require("./services/new_apis/search.js"));
const profile_js_1 = __importDefault(require("./services/new_apis/profile.js"));
const notifications_js_1 = __importDefault(require("./services/new_apis/notifications.js"));
const requests_js_1 = __importDefault(require("./services/new_apis/requests.js"));
const auth_js_1 = __importDefault(require("./services/new_apis/auth.js"));
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '.env') });
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
const url = process.env.MONGO_URI;
(0, mongoose_1.connect)(url).then(() => {
    console.log(`Connected to database information`);
});
const port = process.env.PORT;
app.set('view engine', 'ejs');
app.set('views', (0, path_1.join)(__dirname, '../views'));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use((0, express_1.static)((0, path_1.join)(__dirname, '../public')));
app.use(urlencoded({
    extended: true
}));
app.use((0, express_session_1.default)({
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
app.use((0, cookie_parser_1.default)());
app.use((0, express_fileupload_1.default)());
app.use('/api/users', (0, profile_js_1.default)(io));
app.use('/api/posts', (0, post_js_1.default)(io));
app.use('/api/notifications', (0, notifications_js_1.default)(io));
app.use('/api/requests', (0, requests_js_1.default)(io));
app.use('/api/feed', (0, feed_js_1.default)(io));
app.use('/api/search', (0, search_js_1.default)(io));
app.use('/api/auth', (0, auth_js_1.default)(io));
app.use('/blog', (0, blogs_js_1.default)());
app.use(errors_js_1.default);
app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        res.clearCookie('studentID');
        res.clearCookie('recordID');
        res.clearCookie('username');
        res.clearCookie('connect.sid');
        if (!error) {
            res.redirect('/login');
        }
        else {
            res.redirect('/login');
        }
    });
});
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/support', (req, res) => {
    res.render('support');
});
app.get('/about-us', (req, res) => {
    res.render('about-us');
});
app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy');
});
app.get('/onboarding', (0, onBoardingChecker_js_1.default)(true));
exports.userSocketMap = new Map();
io.on('connection', (socket) => {
    let studentID = socket.handshake.query.studentID;
    if (studentID) {
        exports.userSocketMap.set(studentID, socket.id);
    }
    socket.on('disconnect', () => {
        exports.userSocketMap.forEach((sockID, studentID) => {
            if (sockID === socket.id) {
                exports.userSocketMap.delete(studentID);
            }
        });
    });
    (0, ioNotifcationService_js_1.default)(io, socket);
    (0, ioNoteService_js_1.default)(io, socket);
});
app.get('/message', async (req, res) => {
    if (req.session && req.session["stdid"] == "1094a5ad-d519-4055-9e2b-0f0d9447da02") {
        if (req.query.message == undefined) {
            res.render('message');
        }
        else {
            let message = req.query.message;
            let type = req.query.type;
            await alerts_js_1.default.create({ message: message, type: type });
            res.send({ url: '/dashboard' });
        }
    }
    else {
        res.status(404);
        res.render('404-error', { message: 'The page you are looking for is not found' });
    }
});
app.get('*', (req, res) => {
    res.status(404);
    res.render('404-error', { message: 'The page you are looking for is not found' });
});
server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});
