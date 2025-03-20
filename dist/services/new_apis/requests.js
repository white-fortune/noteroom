"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requestsApiRouter;
const express_1 = require("express");
const requestService_1 = require("../requestService");
const userService_1 = require("../userService");
const router = (0, express_1.Router)();
function requestsApiRouter(io) {
    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            let response = await (0, requestService_1.getRequests)(studentDocID);
            if (response.ok) {
                res.json({ ok: true, requests: response.requests });
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
