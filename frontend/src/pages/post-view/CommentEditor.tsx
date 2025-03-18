import { useEffect, useState } from "react"

export default function TextEditor({ showState: [showEditor, setShowEditor], text: [text, setText], action, reply, loading: [loading, ] }: any) {
	const [isPostBtnDisabled, setIsPostBtnDisabled] = useState<boolean>(true)

	useEffect(() => {
		setIsPostBtnDisabled(text.trim().length === 0)
	}, [text])

	return (
		<div className="quick-post-editor-overlay" style={{display: showEditor ? "flex" : "none", visibility: showEditor ? "visible" : "hidden", opacity: showEditor ? 1 : 0 }}>
			<div className="quick-post-editor-container">
				<div className="qpec-header">
					<h5 className="qpec-title">{ reply ? "Give a reply" : "Give a comment" }</h5>
					<button type="button" className="qpec-close-icon" aria-label="Close Quick Post Editor" onClick={() => setShowEditor((prev: boolean) => !prev)}>
						<svg width="18" height="18" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 3L67 67" stroke="black" strokeWidth="6" strokeLinejoin="round"/>
							<path d="M67 3L3 67" stroke="black" strokeWidth="6" strokeLinejoin="round"/>
						</svg>                  
					</button>
				</div>

				<div className="qpec-body">
					{ reply && <div className="qpec-body-row-user-preview">
						<span className="qpec-username">{reply}</span>
					</div> }
					{ reply && <hr style={{width: "100%"}} /> }
					<div className="qpec-body-row-text-input">
						<textarea className="qpec-textarea" placeholder="Join the conversation" value={text} onChange={(e) => setText(e.target.value)}></textarea>
					</div>
				</div>

				<div className="qpec-footer">
					<button type="button" className={"qpec-footer-btn" + ((isPostBtnDisabled || loading) ? " disabled" : "")} onClick={action} disabled={isPostBtnDisabled || loading}>{ reply ? "Reply" : "Comment" }</button>
				</div>
			</div>
		</div>
	)
}