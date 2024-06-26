import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import Upload from "@aws-sdk/lib-storage";
import sharp from "sharp";

export const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();

const S3Upload = multer({ storage: storage });
// Set up multer to use S3 for storage
// const S3Upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     // acl: "public-read",
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString() + "-" + file.originalname);
//     },
//   }),
// });
export default S3Upload;
