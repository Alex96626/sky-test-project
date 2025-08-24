import express, { Request } from 'express';
import { create } from '../../models/case/create';
import { getCaseList } from '../../models/case/list';

export const caseRoute = express.Router();

caseRoute.put(
    '/case/new:name',
    async (req: Request<{name: string}, unknown, unknown, unknown>, res) => {
        const caseName = req.params.name;

        const createdCase = await create(caseName);

        res.json(createdCase)
    }
);

caseRoute.get('/case/list', async (req, res) => {
    const caseList = getCaseList()

    res.json(caseList);

    res.end();
});