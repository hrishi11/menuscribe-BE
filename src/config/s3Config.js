import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config()
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3Region = process.env.S3_REGION;
const s3 = new S3Client({
    credentials:{
        accessKeyId:s3AccessKeyId,
        secretAccessKey:s3AccessKey
    },
    region:s3Region
})



class bucket {
    s3Conn = s3
    bucketName = ''
    constructor(bucketName){
        this.bucketName = bucketName
        this.uploadFile.bind(this)
    }

    async uploadFile(filePath, fileName, ContentType){
        try{
            console.log('trying to upload the following file: ',filePath, fileName, ContentType)
            const fileContent = fs.readFileSync(filePath);
            
            // Set up parameters for S3 upload
            const uploadParams = {
                Bucket: this.bucketName, // Specify your bucket name
                Key: fileName,
                Body: fileContent,
                ContentType: ContentType,
            };
            
            // Upload file to S3
            const command = new PutObjectCommand(uploadParams);
            const response = await this.s3Conn.send(command);
            
            // Delete the temporary file
            fs.unlinkSync(filePath);
            return `https://${this.bucketName}.s3.${s3Region}.amazonaws.com/${fileName}`
        }catch(err){
            console.error(`Error while uploading file ${fileName} to ${this.bucketName} bucket`,err)
            throw new Error('Unable to Upload file, Please try again')
        }
    }
}

export const menuSelectBucket = new bucket('menuselect')