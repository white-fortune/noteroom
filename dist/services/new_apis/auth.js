"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authApiRouter;
const express_1 = require("express");
const userService_1 = require("../userService");
const router = (0, express_1.Router)();
function authApiRouter(io) {
    router.post("/login", async (req, res) => {
        try {
            let email = req.body.email;
            let password = req.body.password;
            if (email && password && email.length !== 0 && password.length !== 0) {
                let response = await userService_1.LogIn.getProfile(email);
                if (response.ok) {
                    const { data: student } = response;
                    if (student["authProvider"] === null) {
                        if (password === student['studentPass']) {
                            req.session["stdid"] = student["studentID"];
                            res.json({ ok: true, userAuth: { studentID: student["studentID"], username: student["username"] } });
                        }
                        else {
                            res.json({ ok: false, message: "Wrong Password!" });
                        }
                    }
                }
                else {
                    if (response.error === "NO_EMAIL") {
                        res.json({ ok: false, message: "No student profile is associated with that email account!" });
                    }
                    else if (response.error === "SERVER") {
                        res.json({ ok: false, message: "Something went wrong! Please try again a bit later." });
                    }
                }
            }
        }
        catch (error) {
            res.json({ ok: false, message: "Something went wrong! Please try again a bit later." });
        }
    });
    router.get("/session", async (req, res) => {
        try {
            if (req.session && req.session["stdid"]) {
                const response = await (0, userService_1.getUserAuth)(req.session["stdid"]);
                if (response.ok) {
                    res.json({ ok: true, userAuth: response.userAuth });
                }
                else {
                    res.json({ ok: false });
                }
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
