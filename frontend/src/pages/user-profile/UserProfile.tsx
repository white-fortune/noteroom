import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostsSection from "./PostsSection";
import PersonalInformation from "./PersonalInformation";
import BasicInformation from "./BasicInformation"
import { useAppData } from "../../context/AppDataContext";
import "../../public/css/user-profile.css"

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
export default function UserProfile() {
	const { userProfile: [profile, , currentUsername] } = useAppData()
	const [user, setUser] = useState<any>(null)
	const { username } = useParams()
	const [loading, setLoading] = useState<boolean>(true)
	const navigate = useNavigate()

	useEffect(() => {
		async function getProfile() {
			if (username === currentUsername) {
				setLoading(false)
				setUser(profile)
			} else {
				const response = await fetch(`${API_SERVER_URL}/api/users/${username}`, { credentials: 'include' })
				if (response.ok) {
					const data = await response.json()
					setLoading(false)
					if (data && data.ok) {
						setUser(data.profile)
					} else {
						navigate("/not-found", { state: { type: "user", username: username }, replace: true })
					}
				}
			}
		}

		getProfile()
	}, [username, profile])

	return (
		<>
			{ 
				(!loading && user) &&
					<div className="middle-section">
						<div className="nav-section">
							<svg
								className="nav-back-btn"
								onClick={() => navigate(-1)}
								width="20"
								height="auto"
								viewBox="0 0 68 68"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z"
									fill="#1D1B20"
								/>
							</svg>
						</div>
			
						<BasicInformation user={user}></BasicInformation>
			
						<PersonalInformation user={user}></PersonalInformation>
			
						<PostsSection user={user}></PostsSection>
					</div>
			}
		</>
	);
};

