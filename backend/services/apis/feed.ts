import { Router } from "express";
import { Server } from "socket.io";
import { getPosts } from "../services/postService";
import { Convert } from "../services/userService";

const router = Router()

export default function feedApiRouter(io: Server) {
    router.get("/", async (req, res) => {
        try {
            const count = 7
            const page = Number(req.query.page) || 1
            const seed: number = Number(req.query.seed)
            const skip: number = (page - 1) * count
            
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
            let notes = await getPosts(studentDocID, { skip: skip, limit: count, seed: seed })
            if (notes.length != 0) {
                res.json(notes)
            } else {
                res.json([])
            }
        } catch (error) {
            console.error(error)
            res.json([])
        }
    })

    return router
}
