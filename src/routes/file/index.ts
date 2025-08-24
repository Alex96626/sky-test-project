import express, { Request } from 'express';
import { getCaseFileList } from '../../models/file/list';
import { UploadedFileCase } from '../../types';
import { upload } from '../../models/file/upload';
import { merge } from '../../models/file/merge';
import { download } from '../../models/file/download';

export const fileRoute = express.Router();

fileRoute.get('/file/list:id', async (req: Request<{id: string}, unknown, unknown, unknown>, res) => {
    const caseId = req.params.id;

    if (!caseId) {
        throw new Error('Cases not found');
    }

    const filesCase = await getCaseFileList(caseId);

    res.json(filesCase);

    res.end();
});

fileRoute.post(
    '/file/upload',
    async (req: Request<unknown, unknown, UploadedFileCase>, res) => {
        const uploadFile = req.body.file;

        const caseId = req.body.id;

        if (!uploadFile || Object.keys(uploadFile).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        if (!caseId) {
            throw new Error('Case not found');
        }

        await upload(caseId, uploadFile);
    }
);

fileRoute.get('/file/merge:id', async (req: Request<{id: string}, unknown, unknown, unknown>, res) => {
    const caseId = req.params.id;

    if (!caseId) {
        throw new Error('Files not found');
    }

    const mergeFile = await merge(caseId);

    res.json(mergeFile);

    res.end();
});

fileRoute.get(
    '/file/download',
    async (req: Request<unknown, unknown, string>, res) => {
        const fileName: string = String(req.query.fileName);

        if (!fileName) {
            throw new Error('file not found');
        }

        const downloadLink = download(fileName);

        res.json({ link: downloadLink });

        res.end();
    }
);