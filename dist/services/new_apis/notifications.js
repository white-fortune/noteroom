"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notificationApiRouter;
const express_1 = require("express");
const rootInfo_1 = require("../../helpers/rootInfo");
const notificationService_1 = require("../notificationService");
const router = (0, express_1.Router)();
function notificationApiRouter(io) {
    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let response = await (0, rootInfo_1.getNotifications)(studentID);
            if (response.ok) {
                res.json({ ok: true, notifications: response.notifications });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.delete("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let deletedResult = await (0, notificationService_1.deleteAllNoti)(studentID);
            res.json({ ok: deletedResult });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return router;
}
