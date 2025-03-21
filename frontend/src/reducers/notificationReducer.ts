import { IONotification } from "../types/types";


export enum NotificationActions { ADD, READ, DELETE_ALL }
export default function notificationReducer(notifications: IONotification[], actions: { type: NotificationActions, payload?: any }) {
    switch(actions.type) {
        case NotificationActions.ADD:
            return [...notifications, ...actions.payload.notifications]
        case NotificationActions.READ:
            return notifications.map(notification => {
                if (notification.notiID === actions.payload.notiID) {
                    return { ...notification, isRead: true }
                }
                return notification
            })
        case NotificationActions.DELETE_ALL:
            return []
    }
}
