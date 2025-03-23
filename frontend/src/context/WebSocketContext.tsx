import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useUserAuth } from "./UserAuthContext"
import { useAppData } from "./AppDataContext"
import { NotificationActions, NotificationEvent } from "../reducers/notificationReducer"
import { Settings } from "../../settings"

let API_SERVER_URL = Settings.API_SERVER_URL
const WebSocketContext = createContext<any>(null)
export default function WebSocketProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [socket, setSocket] = useState<any>(null)
    const { notification: [, dispatch] } = useAppData()
    const { userAuth } = useUserAuth()!


    useEffect(() => {
        const socket = io(`${API_SERVER_URL}/`, { query: { studentID: userAuth.studentID } })
        setSocket(socket)

        socket?.on(NotificationEvent.NOTIF_COMMENT, (notification: any) => {
            dispatch({ type: NotificationActions.ADD, payload: { notifications: [notification] } })
        })

        return () => {
            socket.disconnect()
            socket.off(NotificationEvent.NOTIF_COMMENT)
        }
    }, [userAuth?.studentID])

    return (
        <WebSocketContext.Provider value={[socket]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(WebSocketContext)
}
