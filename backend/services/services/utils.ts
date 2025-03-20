import fileUpload from "express-fileupload"
import sharp from "sharp"
import { upload } from "./firebaseService"

export async function compressImage(fileObject: any) {
    try {
        let imageBuffer = fileObject.data
        let imageType: "jpeg" | "png" = fileObject.mimetype === "image/jpeg" ? "jpeg" : "png"
        let compressedBuffer = await sharp(imageBuffer)
            [imageType](
                imageType === "png" 
                ? { quality: 70, compressionLevel: 9, adaptiveFiltering: true } 
                : { quality: 70, progressive: true }
            ).toBuffer()

        return { ...fileObject, buffer: compressedBuffer, size: compressedBuffer.length }
    } catch (error) {
        return fileObject
    }
}


export async function processBulkCompressUpload(files: any, noteDocID: any) {
    try {
        let fileObjects = <fileUpload.UploadedFile[]>Object.values(files) 
        let compressedFiles = await Promise.all(fileObjects.map(fileObject => compressImage(fileObject)))
        let uploadedFiles = await Promise.all(compressedFiles.map(compressedFile => upload(compressedFile, `posts/${noteDocID.toString()}/contents/${compressedFile["name"]}`)))
        return uploadedFiles
    } catch (error) {
        return []
    }
}