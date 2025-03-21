import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import ngLogo from "../../assets/ng_logo.png"
import SignUpImage from "../../assets/signup_image.png"
import "../../public/css/signup-login.css"
import { useUserAuth } from '../../context/UserAuthContext';
import slug from 'slug';


const SignUp = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [displayname, setDisplayname] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(true)
    const [, setUserAuth] = useUserAuth()
	const username = useRef<string>("")
    const navigate = useNavigate();

    function showSwal(text: any) {
        return withReactContent(Swal).fire({
            title: "Unable to authenticate",
            confirmButtonText: 'OK',
            html: 
            <>
                <svg fill="#000000" height="100px" width="100px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 612 612" xmlSpace="preserve">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <g> <path d="M460.537,373.781c-65.78,0-119.108,53.329-119.108,119.11S394.756,612,460.537,612s119.111-53.329,119.111-119.11 C579.647,427.11,526.319,373.781,460.537,373.781z M512.649,513.327H408.429c-11.287,0-20.435-9.15-20.435-20.437 c0-11.287,9.149-20.437,20.435-20.437h104.221c11.287,0,20.435,9.15,20.435,20.437 C533.086,504.177,523.936,513.327,512.649,513.327z M267.355,312.662c86.861-0.005,118.115-86.976,126.297-158.417 C403.73,66.237,362.113,0,267.355,0C172.61,0,130.971,66.232,141.058,154.245C149.249,225.686,180.492,312.669,267.355,312.662z M457.287,348.865c2.795,0,5.572,0.084,8.33,0.237c-4.134-5.897-8.918-11.098-14.518-15.276 c-16.691-12.457-38.307-16.544-57.416-24.055c-9.302-3.654-17.632-7.284-25.452-11.416 c-26.393,28.943-60.809,44.084-100.886,44.087c-40.067,0-74.478-15.141-100.867-44.087c-7.82,4.134-16.152,7.762-25.452,11.416 c-19.11,7.51-40.725,11.597-57.416,24.055c-28.866,21.545-36.325,70.012-42.187,103.071c-4.838,27.291-8.086,55.141-9.036,82.862 c-0.735,21.472,9.867,24.483,27.831,30.965c22.492,8.112,45.716,14.135,69.097,19.071c45.153,9.535,91.696,16.862,138.038,17.191 c22.455-0.16,44.956-1.972,67.322-4.873c-16.562-23.996-26.276-53.063-26.276-84.36 C308.401,415.654,375.191,348.865,457.287,348.865z" /> </g> 
                    </g>
                </svg>,
                <p>{text}</p>
            </>
        })
    }

    async function signup() {
        try {
            const formData = new FormData()
            formData.append("displayname", displayname)
            formData.append("email", email)
            formData.append("password", password)
			formData.append("username", username.current)

            const response = await fetch('http://localhost:2000/api/auth/signup', {
                method: "post",
                body: formData,
                credentials: "include"
            })
            if (response.ok) {
                const data = await response.json()
                if (data.ok) {
                    setUserAuth(data.userAuth)
                    navigate("/feed", { replace: true })
                } else {
                    if (!data.displayname) {
						showSwal(data.message || "Someting went wrong! Please try again a bit later")
                    } else {
						const suggested = slug(data.displayname, {
							lower: true,
							symbols: false
						}) + "-sdff21db"
						const result = await withReactContent(Swal).fire({
							input: "text",
							title: data.message,
							html: `Suggested format: <b>${suggested}</b> (no whitespace)`,
							confirmButtonText: "Proceed",
							showCancelButton: true,
							preConfirm: (value: string) => {
								if (value.match(/\s/) === null && value.trim() !== "") {
									username.current = value?.toLowerCase()
								} else {
									Swal.showValidationMessage("No whitespaces are allowed")
									return false
								}
							}
						})
						if (result.isConfirmed) {
							signup()
						}
                    }
                }
            }
        } catch (error) {
            showSwal("Someting went wrong! Please try again a bit later")
        }
    }

    useEffect(() => {
        setIsBtnDisabled(displayname.trim() === "" || email.trim() === "" || password.trim() === "")
    }, [displayname, email, password])

    return (
        <div className="flex-center-evenly">
            <div className="main-container flex-column-center">
                <div className="brand-section flex-column-center">
                    <img src={ngLogo} alt="NoteRoom" className="brand__site-logo" onClick={() => navigate('/')} />
                    <p className="brand__logo-title">NoteRoom</p>
                    <h2 className="brand__main-heading">Create a new account</h2>
                    <p className="txt-gray-light-bold">Join the country’s top note-sharing platform to connect, share, and download notes</p>
                </div>
                
                <div className="acquisition-container flex-column-center">
                    <div id="g_id_onload" data-client_id="325870811550-0c3n1c09gb0mncb0h4s5ocvuacdd935k.apps.googleusercontent.com" data-callback="handleCredentialResponse" data-auto_prompt="false"></div>
                    <div className="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left"></div>
                    
                    <div className="separator flex-center-evenly">
                        <span className="line"></span>
                        <span className="txt-gray-light-bold">Or</span>
                        <span className="line"></span>
                    </div>
                    
                    <div className="custom-form flex-column-center">
                        <input type="text" value={displayname} onChange={(e) => setDisplayname(e.target.value)} name="displayname" placeholder="Your Name" className="custom__input-field" required />
                        <input type="email"value={email} onChange={(e) => setEmail(e.target.value)}  name="email" placeholder="Email (required)" className="custom__input-field" required />
                        
                        <div className="password-container">
                            <input type={passwordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} id="password" name="password" placeholder="Set a password" className="custom__input-field custom__input-field--marginless" required />
                            <button type="button" onClick={() => setPasswordVisible(prev => !prev)} className="toggle-password">
                                {passwordVisible ? "hide" : "show"}
                            </button>
                        </div>
                        
                        <button className="primary-btn flex-center-evenly" disabled={isBtnDisabled} onClick={() => !isBtnDisabled && signup()}>Sign Up</button>
                    </div>
                </div>
                <p className="redirecting-msg">Already have an account? <a href="/login" className="redirect-link">Login</a></p>
            </div>
            <img className="focus-img" src={SignUpImage} alt="Two friends talking about NoteRoom" />
        </div>
    );
};

export default SignUp;