import { Router } from "express";
import { Server } from "socket.io";
import { deleteAllNoti, getNotifications } from "../services/notificationService";

const router = Router()

export default function notificationApiRouter(io: Server) {
    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let response = await getNotifications(studentID)
            if (response.ok) {
                res.json({ ok: true, notifications: response.notifications })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.delete("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let deletedResult = await deleteAllNoti(studentID)
            res.json({ ok: deletedResult })
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
