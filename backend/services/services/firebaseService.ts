import { join } from 'path';
import { config } from 'dotenv';
import firebaseAdmin from 'firebase-admin'; 

config({ path: join(__dirname, '../../../.env') });

// const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED!);
// const bucketName = process.env.DEVELOPMENT === "true" ? process.env.NOTEROOM_DEVELOPMENT_FIREBASE_BUCKET : process.env.NOTEROOM_PRODUCTION_FIREBASE_BUCKET
// firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.cert(serviceAccount), 
//     storageBucket: `gs://${bucketName}`
// });

// let bucket = firebaseAdmin.storage().bucket();

// async function uploadImage(fileObject: any, fileName: any) {
//     try {
//         const file = bucket.file(fileName);
//         await file.save(fileObject.buffer || fileObject.data, {
//             metadata: { contentType: fileObject.mimetype }
//         })
//         await file.makePublic();

//         let publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
//         return publicUrl
//     } catch (error) {
//         return null
//     }    
// }
async function uploadImage(fileObject: any, fileName: any) {
    return 'this is a public url'
}

export const upload = uploadImage;