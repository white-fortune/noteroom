"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
exports.default = seacrhApiRouter;
const express_1 = require("express");
const userService_1 = require("../userService");
exports.router = (0, express_1.Router)();
function seacrhApiRouter(io) {
    exports.router.get("/", async (req, res) => {
        try {
            if (req.query) {
                const term = req.query.q;
                const type = req.query.type;
                const countDoc = req.query.countdoc ? true : false;
                let batch = Number(req.query.batch || "1");
                let maxCount = 20;
                let skip = (batch - 1) * maxCount;
                if (type === "profiles") {
                    let students = await userService_1.SearchProfile.getStudent(term, { maxCount: maxCount, skip: skip, countDoc });
                    res.json(students);
                }
            }
        }
        catch (error) {
            res.json([]);
        }
    });
    return exports.router;
}
