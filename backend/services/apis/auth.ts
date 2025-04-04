import { Router } from 'express';
import { Server } from 'socket.io';
import { addUserProfile, getUserAuth, getUserVarification } from '../services/authService';
import { generateRandomUsername } from '../services/utils';
import { capitalize, sample } from "lodash"
import logger from '../logger';


const router = Router()

export default function authApiRouter(io: Server) {
    router.post("/signup", async (req, res) => {
        try {
            const displayname = req.body.displayname
            const email = req.body.email
            const password = req.body.password
            const username = req.body.username

            if (!(displayname && email && password)) {
                res.json({ ok: false, message: "Fill up the form to proceed" })
            } else {
                let identifier = generateRandomUsername(req.body.displayname.trim())
                let studentData = {
                    displayname: req.body.displayname.trim(),
                    email: req.body.email,
                    password: req.body.password,
                    studentID: identifier["userID"],
                    username: username.trim().length === 0 ? identifier["username"] : username,
                    authProvider: null,
                    onboarded: false
                }
                logger.info(`(/signup): Got user data of username=${studentData.username || '--username--'}`)
                const response = await addUserProfile(studentData)
                if (response.ok) {
                    logger.info(`(/signup): Signed up user of username=${studentData.username || '--username--'}`)
                    const { data: user } = response
                    req.session["stdid"] = user["studentID"]
                    logger.info(`(/signup): Set session of username=${studentData.username || '--username--'}`)
                    res.json({ ok: true, userAuth: { studentID: user["studentID"], username: user["username" ]} })
                } else {
                    if(response.error.code === 11000) {
                        const { keyPattern, keyValue } = response.error
                        const fieldName = Object.keys(keyPattern)[0] as string
                        if (fieldName !== "username") {
                            logger.error(`(/signup): Duplicate field=${fieldName} with ${fieldName}=${keyValue[fieldName]}`)
                            res.json({ ok: false, message: `${capitalize(fieldName)} is already registered` })
                        } else {
                            logger.error(`(/signup): Duplicate field=username with username=${studentData.username || '--username--'}`)
                            res.json({ ok: false, message: "Your username is already in use. We want you write a unique username", displayname })
                        }
                    } else {
                        logger.error(`(/signup): Signup failed, error for username=${studentData.username || '--username--'}: ${response.error}`)
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
                    }
                }
            }
        } catch (error) {
            logger.error(`(/signup): Sign failed, unknown error: ${error}`)
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
        }
    })

    router.post("/login", async (req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password

            if (email && password && email.length !== 0 && password.length !== 0) {
                logger.info(`(/login): Got user data of email=${email || '--email--'}`)
                let response = await getUserVarification(email)
                if (response.ok) {
                    const { data: student } = response
                    if(student["authProvider"] === null) {
                        if (password === student['studentPass']) {
                            req.session["stdid"] = student["studentID"];
                            logger.info(`(/login): NoteRoom login with email=${email || '--email--'}`)
                            res.json({ ok: true, userAuth: { studentID: student["studentID"], username: student["username"] }});
                        } else {
                            res.json({ ok: false, message: "Wrong Password!" })
                        }
                    }
                } else {
                    if (response.code === "NO_EMAIL") {
                        res.json({ ok: false, message: "No student profile is associated with that email account!" })
                    } else if (response.code === "SERVER") {
                        logger.error(`(/login): Login failed with email=${email || '--email--'}: ${response.error}`)
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
                    }
                }
            }
        } catch (error) {
            logger.error(`(/login): Login failed, unknown error: ${error}`)
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
        }
    })

    router.get("/session", async (req, res) => {
        try {
            if (req.session && req.session["stdid"]) {
                const response = await getUserAuth(req.session["stdid"])
                if (response.ok) {
                    logger.info(`(/session): Got user auth of studentID=${req.session["stdid"] || '--studentID--'}`)
                    res.json({ ok: true, userAuth: response.userAuth });
                } else {
                    logger.error(`(/session): Failed to get user auth of studentID=${req.session["stdid"] || '--studentID--'}: ${response.error}`)
                    res.json({ ok: false })
                }
            } else {
                logger.error(`(/session): Failed to get user auth of studentID=${req.session["stdid"] || '--studentID--'}: req.session || req.session[stdid] was not found`)
                res.json({ ok: false });
            }
        } catch (error) {
            logger.error(`(/session): Failed to get user auth of studentID=${req.session["stdid"] || '--studentID--'}: ${error}`)
            res.json({ ok: false });
        }
    })
    

    return router
}