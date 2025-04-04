import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import feedReducer, { FeedActions } from "../reducers/feedReducer";
import { SavedNoteObject } from "../types/types";
import { useAppData } from "./AppDataContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
export const FeedNoteContext = createContext<any>(null)
export default function FeedNotesProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [feedNotes, dispatch] = useReducer(feedReducer, [])
    const [loading, setLodaing] = useState<boolean>(true)
    const [page, setPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const { savedNotes: [, setSavedNotes] } = useAppData()

    const observer = useRef<IntersectionObserver | null>(null)

    const lastNoteRef = useCallback((node: any) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasMore) {
                await fetchNotes()
            }
        })

        if (node) observer.current.observe(node)
    }, [loading])

    function fireToast(title: string) {
        return withReactContent(Swal).fire({
            toast: true,
            position: "bottom-right",
            title: title,
            showConfirmButton: true,
            timer: 3000,
            timerProgressBar: true
        })
    }

    async function fetchNotes() {
        setLodaing(true)
        try {
            let response = await fetch(`${API_SERVER_URL}/api/feed?seed=601914080&page=${page}`, { credentials: 'include' });
            let notes = await response.json()
            if (notes.length !== 0) {
                setLodaing(false)
                dispatch({ type: FeedActions.ADD_NOTES, payload: { notes: notes } })
                setPage(prev => prev + 1)
            } else {
                setLodaing(false)
                setHasMore(false)
                return
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function upvoteNote(noteID: string, upvoteState: boolean) {
        try {
            dispatch({ type: FeedActions.TOGGLE_UPVOTE_NOTE, payload: { noteID: noteID } })
            let response = await fetch(`${API_SERVER_URL}/api/posts/${noteID}/vote?type=upvote${upvoteState ? '&action=delete' : ''}`, {
                method: "post",
                credentials: "include"
            })
            if (response.ok) {
                let data = await response.json()
                return { ok: data.ok }
            } else {
                return { ok: false }
            }
        } catch (error) {
            return { ok: true, error: error }
        }
    }
    async function saveNote({ noteID, noteTitle, noteThumbnail }: SavedNoteObject, savedState: boolean) {
        try {
            dispatch({ type: FeedActions.TOGGLE_SAVE_NOTE, payload: { noteID: noteID } })
            setSavedNotes((prev: any) => {
                if (savedState) {
                    return prev.filter((note: SavedNoteObject) => note.noteID !== noteID)
                } else {
                    return [...prev, { noteID, noteTitle, noteThumbnail }]
                }
            })

            let response = await fetch(`${API_SERVER_URL}/api/posts/${noteID}/save?action=${savedState ? 'delete' : 'save'}`, {
                method: 'put',
                credentials: "include"
            })
            if (response.ok) {
                let data = await response.json()
                if (data.ok) {
                    fireToast(savedState ? "Removed from saved" : "Post saved")
                }
            } else {
                return { ok: false }
            }
        } catch (error) {
            return { ok: false }
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    return (
        <FeedNoteContext.Provider value={{ feedNotes, loading, fetchNotes, lastNoteRef, dispatch, FeedActions, controller: [upvoteNote, saveNote] }}>
            {children}
        </FeedNoteContext.Provider>
    )
}

export function useFeed() {
    let context = useContext(FeedNoteContext)
    return context
}