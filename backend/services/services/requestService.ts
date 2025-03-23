import Requests from "../../schemas/requests"


export async function getRequest(requestID: string) {
    try {
        let request = await Requests.findOne({ _id: requestID })
        let extendedRecData = await request.populate([
            { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
            { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
        ])
        return { ok: true, request: extendedRecData }
    } catch (error) {
        return { ok: false }
    }
}

export async function getRequests(ownerDocID: string) {
    try {
        let requests = await Requests.find({ receiverDocID: ownerDocID })
        let extendedRecData = await Promise.all(requests.map(async recData => {
            return recData.populate([
                { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
                { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
            ]) 
        }))
        return { ok: true, requests: extendedRecData }
    } catch (error) {
        return { ok: false }
    }
}

export async function addRequest(reqdata: any) {
    try {
        let requestDocument = await Requests.create(reqdata)
        let requestData = await requestDocument.populate([
            { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
            { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
        ]) 
        return { ok: true, requestData }
    } catch (error) {
        return { ok: false }
    }
}
export async function deleteRequest(reqID: string) {
    try {
        let deleteResult = await Requests.deleteOne({ _id: reqID })
        return { ok: deleteResult.deletedCount !== 0 }
    } catch (error) {
        return { ok: false }
    }
}
