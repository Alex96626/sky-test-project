import express, { Request } from 'express';
import { getCaseFileList } from '../../models/file/list';
import { UploadedFileCase } from '../../types';
import { uploadCaseFile } from '../../models/file/upload';
import { mergeFiles } from '../../models/file/merge';
import { download } from '../../models/file/download';

export const fileRoute = express.Router();

fileRoute.get('/file/list:id', async (req: Request<{id: string}, unknown, unknown, unknown>, res) => {
    const caseId = req.params.id;

    if (!caseId) {
        res.status(400);

        res.json({
            message: 'Param "id" must be not empty'
        })

        res.end();
    }

    const filesCase = await getCaseFileList(caseId);

    res.json(filesCase);

    res.end();
});

fileRoute.post(
    '/file/upload: id',
    async (req: Request<{id: string}, unknown, UploadedFileCase>, res) => {
        const uploadFile = req.body.file;

        const caseId = req.params.id;

        if (!uploadFile || Object.keys(uploadFile).length === 0) {
            res.status(400)
            
            res.json({
                message: 'No files were uploaded.'
            });

            res.end();
        }

        if (!caseId) {
            res.status(400);

            res.json({
                message: 'Param "id" must be mot empty'
            })

            res.end();
        }

        await uploadCaseFile(caseId, uploadFile);
    }
);

fileRoute.get('/file/merge:id', async (req: Request<{id: string}, unknown, unknown, unknown>, res) => {
    const caseId = req.params.id;

    if (!caseId) {
        res.status(400);
        
        res.json({
            message: 'Param "id" must be not empty'
        })

        res.end();
    }

    const mergeFile = await mergeFiles(caseId);

    res.json(mergeFile);

    res.end();
});

fileRoute.get(
    '/file/download',
    async (req: Request<unknown, unknown, string>, res) => {
        const fileName: string = String(req.query.fileName);

        if (!fileName) {
            res.status(400);
            res.json( {
                message: 'file not found'
            })

            res.end();
        }

        const downloadLink = download(fileName);

        res.json({ link: downloadLink });

        res.end();
    }
);