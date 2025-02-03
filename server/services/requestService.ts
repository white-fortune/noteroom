import Requests from "../schemas/requests"

export async function addRequest(requestData: any) {
    let recData = await Requests.create(requestData)
    return recData.populate([
        { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
        { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
    ]) 
}
