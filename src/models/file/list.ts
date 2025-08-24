import { readFile } from 'node:fs/promises';
import { CaseFile, ReturnedFileList } from '../../types';

export const getCaseFileList = async (id: string): Promise<ReturnedFileList> => {
    const files = await readFile('./db/casesFiles.json', 'utf-8');

    const filesList: Array<CaseFile> = JSON.parse(files);

    const filesCase = filesList
        .filter((file) => file.caseId === String(id))
        .map((file) => ({
            id: file.id,
            name: file.files.docx,
        }));

    return filesCase;
};
