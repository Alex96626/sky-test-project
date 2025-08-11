import { Upload } from '@aws-sdk/lib-storage';
import { s3 } from './YStorageUploadFile';
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';

type uploadType = {
    Bucket: string,
    Key: string,
    Body: File,
}

export const s3Upload = async (body:File): Promise<CompleteMultipartUploadCommandOutput> => {
    const params: uploadType = {
        Bucket: 'test-cases',
        Key: body.name,
        Body: body,
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

