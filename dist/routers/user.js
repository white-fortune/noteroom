"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_js_1 = require("../services/userService.js");
const router = (0, express_1.Router)();
function userRouter(io) {
    router.get('/:username?', async (req, res, next) => {
        try {
            if (req.params.username) {
                let username = req.params.username;
                let visiterStudentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d";
                let profileStudentID = await userService_js_1.Convert.getStudentID_username(username);
                let profile = await (0, userService_js_1.getProfile)(username);
                if (profile.ok) {
                    res.json({ ok: true, profile: { ...profile.student, owner: visiterStudentID === profileStudentID } });
                }
                else {
                    res.json({ ok: false, message: "Sorry, nobody on NoteRoom goes by that name." });
                }
            }
            else {
                res.json({ ok: false, message: "Page not found!" });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    return router;
}
exports.default = userRouter;
