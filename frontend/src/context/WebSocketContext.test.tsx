import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"

const WebSocketContext = createContext<any>(null)
export default function WebSocketProvider({ children }: any) {
    const [socket, setSocket] = useState<any>(null)

    useEffect(() => {
        const socket = io("http://localhost:2000/", { query: { studentID: "9181e241-575c-4ef3-9d3c-2150eac4566d" } })
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
