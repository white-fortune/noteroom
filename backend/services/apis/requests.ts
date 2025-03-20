import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/userService";
import { getRequests } from "../services/requestService";

const router = Router()

export default function requestsApiRouter(io: Server) {

    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response = await getRequests(studentDocID)
            if (response.ok) {
                res.json({ ok: true, requests: response.requests })         
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
