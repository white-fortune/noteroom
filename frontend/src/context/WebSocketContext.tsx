import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useUserAuth } from "./UserAuthContext"

const WebSocketContext = createContext<any>(null)
export default function WebSocketProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [socket, setSocket] = useState<any>(null)
    const [userAuth] = useUserAuth()

    useEffect(() => {
        const socket = io("http://localhost:2000/", { query: { studentID: userAuth.studentID } })
        setSocket(socket)

        return () => { socket.disconnect() }
    }, [])

    return (
        <WebSocketContext.Provider value={[socket]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(WebSocketContext)
}
