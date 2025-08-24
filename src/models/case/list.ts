import { readFile } from 'node:fs/promises';
import { CaseList } from '../../types';

export const getCaseList = async (): Promise<CaseList>  => {
    const caseList = await readFile('./db/cases.json', 'utf-8');
    const caseListToJson: CaseList = await JSON.parse(caseList);

    return caseListToJson;
}