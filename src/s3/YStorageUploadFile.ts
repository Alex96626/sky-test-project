import { S3Client} from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();
 
const s3 = new S3Client({
  endpoint: 'https://storage.yandexcloud.net',
  region: 'ru-central1',
  credentials: {
    accessKeyId: String(process.env.S3_KEY),
    secretAccessKey: String(process.env.S3_SECRET_KEY),
  },
  forcePathStyle: true,
});

export { s3 };