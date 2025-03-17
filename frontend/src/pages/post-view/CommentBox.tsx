import { useContext, useState } from "react"
import { CommentsControllerContext } from "./CommentsContainer"
import { useParams } from "react-router-dom"

export default function CommentEditor() {
	const { comments: [, setComments] } = useContext(CommentsControllerContext)
	const [commentData, setCommentData] = useState<string>("")
	const { postID } = useParams()
	async function sendComment() {
		try {
			const feedbackFormData = new FormData()
			feedbackFormData.append("feedbackContent", commentData)

			const response = await fetch(`http://localhost:2000/api/posts/${postID}/feedbacks`, {
				method: "post",
				body: feedbackFormData,
				credentials: "include"
			})
			if (response.ok) {
				const jsonData = await response.json()
				if (jsonData.ok) {
					const comment = jsonData.feedback
					let fetchedComment = [
						{
							_id: comment._id,
							feedbackContents: comment.feedbackContents,
							commenterDocID: {
								profile_pic: comment.commenterDocID.profile_pic,
								displayname: comment.commenterDocID.displayname,
								username: comment.commenterDocID.username
							},
							replyCount: 0,
							upvoteCount: 0,
							createdAt: comment.createdAt,
							isUpVoted: false
						},
						[]
					]
					setComments((comments: any) => [...[fetchedComment], ...comments])
					setCommentData("")
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
			<textarea name="comment-data" value={commentData} onChange={(e) => setCommentData(e.target.value)}></textarea>
			<button onClick={sendComment}>send</button>
		</>
	)
}