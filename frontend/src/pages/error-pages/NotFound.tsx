import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

type NoteFound = {
    title: string,
    message: string,
    btnText: string,
    btnRedirect: string
}
export default function NotFound() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const [content, setContent] = useState<NoteFound>()

    useEffect(() => {
        if (!state?.type) {
            navigate('/', { replace: true })
        } else {
            switch(state?.type) {
                case "page":
                    setContent({
                        title: `Page not found`,
                        message: `Looks like you are lost. The page "${state?.route}" doesn't really exist!`,
                        btnText: "Go Home",
                        btnRedirect: "/"
                    })
                    break
                case "user":
                    setContent({
                        title: "User not found",
                        message: `No one in NoteRoom goes by "${state?.username}"`,
                        btnText: "Search Users",
                        btnRedirect: "/search-profile"
                    })
                    break
                    
            }
        }
    }, [navigate, location])


    return (
        <>
            <p style={{fontSize: "50px"}}>{content?.title}</p>
            <p style={{fontSize: "20px"}}>{content?.message}</p>
            <button onClick={() => navigate(content?.btnRedirect as string)}>{content?.btnText}</button>
        </>
    )
}
