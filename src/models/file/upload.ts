import { readFile, access, writeFile, unlink } from 'node:fs/promises';
import path from 'path';
import { CaseFile, UploadedFileCase } from '../../types';
import { convertWordFiles } from 'convert-multiple-files';
import { s3Upload } from '../../s3/upload';
import { CASE_DB_FILES } from '../../config/const';
import { UploadedFile } from 'express-fileupload';
import { Md5 } from '@smithy/md5-js';

export const uploadCaseFile = async (caseId: string, sampleFile: UploadedFile) => {
    const pathToFileList = path.join(process.cwd(), CASE_DB_FILES);

    const [fileName] = sampleFile.name.split('.');

    const uploadPath = './' + sampleFile.name;

    sampleFile.mv(uploadPath, async function (error) {
        if (error) {
            return error;
        }

        const pdfFileLink = await convertWordFiles(
            path.resolve(uploadPath),
            'pdf',
            path.resolve('./')
        );

        const pdfMd5Hash = new Md5();

        const setNewFileData: CaseFile = {
            id: sampleFile.md5,
            caseId: caseId,
            files: {
                docx: {
                    fileName: `${fileName}.docs`,
                    md5: sampleFile.md5,
                },
                pdf: {
                    fileName: `${fileName}.pdf`,
                    md5: String(pdfMd5Hash)
                },
            },
        };

        try {
            await access(pathToFileList);
        } catch (error) {
            await writeFile(pathToFileList, '[]');
        }

        let fileData = await readFile(pathToFileList, 'utf8');

        const currentFileData = JSON.parse(fileData);

        currentFileData.push(setNewFileData);

        await writeFile(pathToFileList, JSON.stringify(currentFileData));

        await s3Upload(sampleFile.md5, uploadPath);
        await s3Upload(pdfMd5Hash, pdfFileLink);

        await unlink(uploadPath);
        await unlink(pdfFileLink);
    });
};
