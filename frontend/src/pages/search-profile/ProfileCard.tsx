import { useNavigate } from "react-router-dom"
import AvatarImage from "../../assets/avatars/avatar-1.png"

export default function Profile({ user }: { user: any }) {
    const navigate = useNavigate()
    return (
        <div className="prfl" onClick={() => navigate(`/user/${user.username}`)}>
            <img src={(user.profile_pic as string).startsWith("http") ? user.profile_pic : AvatarImage} alt="Profile Pic" className="prfl-pic" />
            <div className="results-prfl-info">
                <span className="prfl-name">{user.displayname}</span>
                <span className="prfl-desc">{user.bio.slice(0, 30)}...</span>
            </div>
        </div>
    )
}
