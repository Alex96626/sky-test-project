import { access, writeFile, readFile } from 'node:fs/promises';
import uniqid from 'uniqid';
import { CaseData } from '../../types';
import path from 'node:path';
import { CASE_DB_PATH } from '../../config/const';

export const create = async (name: string) => {
    const caseId = uniqid(name);
    const dateCreated: string = new Date().toLocaleString('ru');
    const pathToCaseList = path.join(process.cwd(), CASE_DB_PATH);

    const caseData: CaseData = {
        id: caseId,
        name,
        created: dateCreated,
    };

    try {
        await access(pathToCaseList);
    } catch (error) {
        await writeFile(pathToCaseList, '[]');
    }

    let fileData = await readFile(pathToCaseList, 'utf8');

    const currentFileData = JSON.parse(fileData);

    currentFileData.push(caseData);

    await writeFile(pathToCaseList, JSON.stringify(currentFileData));

    return caseData;
};
