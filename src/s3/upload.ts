import { Upload } from '@aws-sdk/lib-storage';
import { s3 } from './YStorageUploadFile';
import { CompleteMultipartUploadCommandOutput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Md5 } from '@smithy/md5-js';

export const s3Upload = async (md5Hash: Md5 | string, filePath: string): Promise<CompleteMultipartUploadCommandOutput> => {
    const params: PutObjectCommandInput = {
        Bucket: 'test-cases',
        Key: String(md5Hash),
        Body: filePath,
    };

    const upload = new Upload({
    client: s3,
    params,
    });

    upload.on('httpUploadProgress', (progress) => {
        console.log(progress.loaded + " of " + progress.total + " bytes");
    });

    const data = await upload.done();

    return data;
}

