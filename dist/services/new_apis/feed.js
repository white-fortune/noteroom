"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = feedApiRouter;
const express_1 = require("express");
const noteService_1 = require("../noteService");
const userService_1 = require("../userService");
const router = (0, express_1.Router)();
function feedApiRouter(io) {
    router.get("/", async (req, res) => {
        try {
            const count = 7;
            const page = Number(req.query.page) || 1;
            const seed = Number(req.query.seed);
            const skip = (page - 1) * count;
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            let notes = await (0, noteService_1.getPosts)(studentDocID, { skip: skip, limit: count, seed: seed });
            if (notes.length != 0) {
                res.json(notes);
            }
            else {
                res.json([]);
            }
        }
        catch (error) {
            console.error(error);
            res.json([]);
        }
    });
    return router;
}
