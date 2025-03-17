import { useContext, useState } from "react"
import { CommentsControllerContext } from "./CommentsContainer"
import { useParams } from "react-router-dom"

export default function ThreadEditor() {
    const [replyData, setReplyData] = useState<string>("")
    const { openedThreadID: [openedThreadID,], comments: [, setComments] } = useContext(CommentsControllerContext)
    const { postID } = useParams()

    async function sendReply() {
        const threadID = openedThreadID.split("-")[1]
        try {
            const replyFormData = new FormData()
            replyFormData.append("replyContent", replyData)

            const response = await fetch(`http://localhost:2000/api/posts/${postID}/feedbacks/${threadID}/replies`, {
                method: "post",
                body: replyFormData,
                credentials: "include"
            })
            if (response.ok) {
                const jsonData = await response.json()
                if (jsonData.ok) {
                    const reply = jsonData.reply
                    const fetchedReply = {
                        _id: reply._id,
                        feedbackContents: reply.feedbackContents,
                        commenterDocID: {
                            profile_pic: reply.commenterDocID.profile_pic,
                            displayname: reply.commenterDocID.displayname,
                            username: reply.commenterDocID.username
                        },
                        parentFeedbackDocID: reply.parentFeedbackDocID._id,
                        createdAt: reply.createdAt
                    }
                    setComments((commentData: any[]) => {
                        return commentData.map(comment => {
                            if (comment[0]._id === threadID) {
                                return [comment[0], [...comment[1], ...[fetchedReply]]]
                            }
                            return comment
                        })
                    })
                    setReplyData("")
                } else {
                    console.log(jsonData)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <textarea name="reply-data" value={replyData} onChange={(e) => setReplyData(e.target.value)}></textarea>
            <button onClick={sendReply}>send</button>
        </>
    )
}