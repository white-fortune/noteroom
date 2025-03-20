"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProfileApiRouter = searchProfileApiRouter;
const express_1 = require("express");
const userService_1 = require("../../services/userService");
const router = (0, express_1.Router)();
function searchProfileApiRouter(io) {
    router.get('/random', async (req, res, next) => {
        try {
            let count = parseInt(req.query.count) || 5;
            let exclude = JSON.parse(req.query.exclude ? req.query.exclude : '[]');
            let students = await userService_1.SearchProfile.getRandomStudent(count, exclude);
            res.json(students);
        }
        catch (error) {
            res.json([]);
        }
    });
    router.get('/mutual-college', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d";
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            if (!req.query.batch) {
                let profiles = await userService_1.SearchProfile.getMutualCollegeStudents(studentDocID);
                res.json(profiles);
            }
            else {
                let batch = Number(req.query.batch || "1");
                let count = 15;
                let skip = (batch - 1) * count;
                let countDoc = req.query.countdoc ? true : false;
                let profiles = await userService_1.SearchProfile.getMutualCollegeStudents(studentDocID, { count: count, skip: skip, countDoc });
                res.json(profiles);
            }
        }
        catch (error) {
            res.json([]);
        }
    });
    return router;
}
