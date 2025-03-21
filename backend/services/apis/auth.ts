import { Router } from 'express';
import { Server } from 'socket.io';
import { addUserProfile, getUserAuth, getUserVarification } from '../services/authService';
import { generateRandomUsername } from '../services/utils';
import { capitalize, sample } from "lodash"


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
                const response = await addUserProfile(studentData)
                if (response.ok) {
                    const { data: user } = response
                    req.session["stdid"] = user["studentID"]
                    res.json({ ok: true, userAuth: { studentID: user["studentID"], username: user["username" ]} })
                } else {
                    if(response.error.code === 11000) {
                        const { keyPattern } = response.error
                        const fieldName = Object.keys(keyPattern)[0] as string
                        if (fieldName !== "username") {
                            res.json({ ok: false, message: `${capitalize(fieldName)} is already registered` })
                        } else {
                            res.json({ ok: false, message: "Your username is already in use. We want you write a unique username", displayname })
                        }
                    } else {
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
                    }
                }
            }
        } catch (error) {
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
        }
    })


    router.post("/login", async (req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password

            if (email && password && email.length !== 0 && password.length !== 0) {
                let response = await getUserVarification(email)
                if (response.ok) {
                    const { data: student } = response
                    if(student["authProvider"] === null) {
                        if (password === student['studentPass']) {
                            req.session["stdid"] = student["studentID"];
                            res.json({ ok: true, userAuth: { studentID: student["studentID"], username: student["username"] }});
                        } else {
                            res.json({ ok: false, message: "Wrong Password!" })
                        }
                    }
                } else {
                    if (response.error === "NO_EMAIL") {
                        res.json({ ok: false, message: "No student profile is associated with that email account!" })
                    } else if (response.error === "SERVER") {
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
                    }
                }
            }
        } catch (error) {
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." })
        }
    })

    router.get("/session", async (req, res) => {
        try {
            if (req.session && req.session["stdid"]) {
                const response = await getUserAuth(req.session["stdid"])
                if (response.ok) {
                    res.json({ ok: true, userAuth: response.userAuth });
                } else {
                    res.json({ ok: false })
                }
            } else {
                res.json({ ok: false });
            }
        } catch (error) {
            res.json({ ok: false });
        }
    });
    

    return router
}