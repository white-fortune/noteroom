import { Server } from "socket.io"
import { Notifs, InteractionNotifs } from "../../schemas/notifications"
import { userSocketMap } from "../../server"


interface IONotification {
    notiID: string,
    title: string,
    content: string,
    redirectTo: string | undefined,
    inRead: false,
    createdAt: string,
    fromUser: {
        profile_pic: string,
        displayname: any,
        username: any
    }
}

export function NotificationSender(io: Server, globals?: any) {
    return {
        //content: for interactions, only the text of the interaction (after the profile-picture and displayname)
        async sendNotification({ content, title = '', event }, fromUserSudentDocID?: any, additional?: any) {
            try {
                let ownerStudentID = globals.ownerStudentID
                let redirectTo = globals.redirectTo || ""

                let baseDocument = {
                    notiType: event,
                    content: content,
                    title: title,
                    redirectTo: redirectTo,
                    ownerStudentID: ownerStudentID
                }

                let notification_db = !fromUserSudentDocID ? baseDocument : { ...baseDocument, fromUserSudentDocID }
                let notification_document = !fromUserSudentDocID ? await addNoti(baseDocument) : await addInteractionNoti(notification_db)

                let notification_io = {
                    notiID: notification_document["_id"].toString(),
                    title: notification_db.title,
                    content: notification_db.content,
                    redirectTo: redirectTo,
                    isRead: "false",
                    createdAt: notification_document["createdAt"],
                    fromUserSudentDocID: !fromUserSudentDocID ? null : notification_document["fromUserSudentDocID"],
                    additional: additional || null
                }
                io.to(userSocketMap.get(ownerStudentID)).emit(event, notification_io)

                return true
            } catch (error) {
                return false
            }
        }
    }
}

export async function getNotifications(ownerStudentID: string) {
    try {
        let notifications = await Notifs.aggregate([
            { $match: { ownerStudentID: ownerStudentID } },
            { $lookup: {
                from: "students",
                localField: "fromUserSudentDocID",
                foreignField: "_id",
                as: "fromUserSudentDocID"
            } },
            { $unwind: {
                path: "$fromUserSudentDocID",
                preserveNullAndEmptyArrays: true
            } },
            { $addFields: {
                isInteraction: { $ne: [{$type: "$fromUserSudentDocID"}, "missing"] },
                fromUser: {
                    profile_pic: "$fromUserSudentDocID.profile_pic", 
                    displayname: "$fromUserSudentDocID.displayname", 
                    username: "$fromUserSudentDocID.username"
                },
            } },
            { $project: {
                _id: 0,
                notiID: "$_id", title: 1, content: 1, isRead: 1, createdAt: 1, notiType: 1, isInteraction: 1,
                redirectTo: {
                    $cond: {
                        if: { $eq: [{ $strLenCP: "$redirectTo" }, 0] },
                        then: null,
                        else: "$redirectTo"
                    }
                },
                fromUser: {
                    $cond: {
                        if: { $eq: [ { $size: { $objectToArray: "$fromUser" } }, 0 ] },
                        then: "$$REMOVE",
                        else: "$fromUser"
                    }
                }
            } }
        ])
        return { ok: true, notifications: notifications }
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
    try {
        await Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } })
        return { ok: true }
    } catch (error) {
        return { ok: false }
    }
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