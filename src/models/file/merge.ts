import { GetObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import PDFMerger from "pdf-merger-js";
import path from 'path';
import { s3 } from "../../s3/YStorageUploadFile";
import { CaseFile } from "../../types";
import { CASE_DB_FILES } from "../../config/const";

export const mergeFiles = async (id: string): Promise<Buffer> => {
    const pathToFileList = path.join(process.cwd(), CASE_DB_FILES);
    
    const files = await readFile(pathToFileList, 'utf-8');

    const filesList: Array<CaseFile> = JSON.parse(files);
    const filesCase = filesList.filter((file) => file.caseId === id);

    const merger = new PDFMerger();

    for (const files of filesCase) {
        const pdfFileName = files.files.pdf;

        const command = new GetObjectCommand({
            Bucket: 'test-cases',
            Key: pdfFileName?.fileName,
        });

        const response = await s3.send(command);
        const body = await response.Body?.transformToByteArray();

        if (!body) {
            continue;
        }

        const fileBuffer = Buffer.from(body);

        await merger.add(fileBuffer);
    }

    const mergedFile = await merger.saveAsBuffer();

    return mergedFile;
}