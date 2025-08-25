import { readFile, access, writeFile, unlink } from 'node:fs/promises';
import path from 'path';
import { CaseFile, UploadedFileCase } from '../../types';
import { convertWordFiles } from 'convert-multiple-files';
import { s3Upload } from '../../s3/upload';
import { CASE_DB_FILES } from '../../config/const';
import { UploadedFile } from 'express-fileupload';

export const uploadCaseFile = async (caseId: string, sampleFile: UploadedFile) => {
    const pathToFileList = path.join(process.cwd(), CASE_DB_FILES);

    const [fileName] = sampleFile.name.split('.');

    const uploadPath = './' + sampleFile.name;

    const fileToBinary = new Uint8Array(sampleFile.data);
    const file = new File([fileToBinary], sampleFile.name, {
        type: sampleFile.mimetype,
    });

    sampleFile.mv(uploadPath, async function (error) {
        if (error) {
            return error;
        }

        const pdfFileLink = await convertWordFiles(
            path.resolve(uploadPath),
            'pdf',
            path.resolve('./')
        );

        const pdfFileBinary = await readFile(pdfFileLink);

        const pdfFile = new File(
            [new Uint8Array(pdfFileBinary)],
            `${fileName}.pdf`,
            {
                type: 'application/pdf',
            }
        );

        const setNewFileData: CaseFile = {
            id: sampleFile.md5,
            caseId: caseId,
            files: {
                docx: `${fileName}.docs`,
                pdf: `${fileName}.pdf`,
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

        await s3Upload(file);
        await s3Upload(pdfFile);

        await unlink(uploadPath);
        await unlink(pdfFileLink);
    });
};
