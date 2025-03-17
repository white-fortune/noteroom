import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AppDataProvider from "./AppDataContext";
import FeedNotesProvider from "./FeedNoteContext";
import ScrollPositionProvider from "./ScrollPosition";

const UserAuthContext = createContext<any>(null)

export default function UserAuthProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [userAuth, setUserAuth] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        async function getUserAuth() {
            try {
                const response = await fetch('http://localhost:2000/api/auth/session', {
                    method: 'get',
                    credentials: 'include'
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data && data.ok) {
                        setUserAuth(data.userAuth)
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        getUserAuth()
    }, [])

    return (
        <UserAuthContext.Provider value={[userAuth, setUserAuth, loading]}>
            {userAuth ? <AuthenticatedProviders>{children}</AuthenticatedProviders> : children}
        </UserAuthContext.Provider>
    )
}

function AuthenticatedProviders({ children }: { children: ReactNode | ReactNode[] }) {
    return (
        <ScrollPositionProvider>
            <AppDataProvider>
                <FeedNotesProvider>
                    {children}
                </FeedNotesProvider>
            </AppDataProvider>
        </ScrollPositionProvider>
    )
}

export function useUserAuth() {
    return useContext(UserAuthContext)
}