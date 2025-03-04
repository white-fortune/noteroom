export function NoteEngagement({ upvote, upvoteCount, isQuickPost, controller: [upvoteManage] }: any) {
    return (
        <div className="engagement-bar">
            <div className="note-engagement" style={{justifyContent: "left"}}>
                <div className="uv-container" id="upvote-container" onClick={() => upvoteManage()} >
                    <svg className="uv-icon" width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    { 
                        upvote ?
                            <>
                                <path d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z" fill="url(#paint0_linear_4170_1047)"></path>
                                <defs>
                                    <linearGradient id="paint0_linear_4170_1047" x1="-53.407" y1="-16.9324" x2="14.9989" y2="40.0465" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#04DBF7"></stop>
                                        <stop offset="1" stop-color="#FF0000"></stop>
                                    </linearGradient>
                                </defs> 
                            </> :
                            <path d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z" stroke="#1E1E1E" stroke-width="0.909091" stroke-linecap="round" stroke-linejoin="round"></path>
                    }
                    </svg> 
                </div>
    
                { 
                    !isQuickPost ? 
                        <svg className="download-icon" width="28" height="28" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859" stroke="#1E1E1E" stroke-width="2.29523" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg> : ''
                }
    
                <svg className="share-icon" data-noteid="67b464e889a7fabce2c11ca6" data-notetitle="Chapter 2" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28.0003 15.2775L15.2003 6.79883L15.2003 11.5988C4 13.9988 4 25.1988 4 25.1988C4 25.1988 8.8 18.7988 15.2003 19.5988L15.2003 24.5588L28.0003 15.2775Z" stroke="black" stroke-linejoin="round"></path>
                </svg>
            </div>

            <span className="engagement-count">{upvoteCount}&nbsp;Likes</span>
        </div>
    )
}