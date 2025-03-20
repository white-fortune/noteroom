import { Notifs, InteractionNotifs } from "../../schemas/notifications"

export async function getNotifications(ownerStudentID: string) {
    try {
        let allNotifications = await Notifs.find({ ownerStudentID: ownerStudentID })
        let populatedNotifications = []
    
        await Promise.all(
            allNotifications.map(async (notification) => {
                if (notification["docType"] === 'interaction') {
                    let populatedNotification = await notification.populate('fromUserSudentDocID', 'displayname username profile_pic')
                    populatedNotifications.push(populatedNotification)
                } else {
                    populatedNotifications.push(notification)
                }
            })
        )
        return { ok: true, notifications: populatedNotifications }
    } catch (error) {
        return { ok: false }
    }
}


export async function deleteAllNoti(ownerStudentID: string) {
    try {
        let result = await Notifs.deleteMany({ ownerStudentID: ownerStudentID })
        return result.deletedCount !== 0
    } catch (error) {
        return false
    }
}


export async function readNoti(notiID: string) {
    await Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } })
}

export async function deleteNoti(notiID: string) {
    await Notifs.deleteOne({ _id: notiID })
}

export async function addNoti(notiData: any) {
    let data = await Notifs.create(notiData)
    return data
}
export async function addInteractionNoti(notiData: any) {
    let data = await InteractionNotifs.create(notiData)
    return data.populate('fromUserSudentDocID', 'displayname username profile_pic')
}