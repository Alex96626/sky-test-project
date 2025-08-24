import express, { Request } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { access, writeFile, readFile, unlink } from 'node:fs/promises';
import path from 'path';
import cors from 'cors';
import { convertWordFiles } from 'convert-multiple-files';
import { s3Upload } from './s3/upload';
import { s3Download } from './s3/download';
import { addNewCase, setNewFile } from './dbEvents';
import uniqid from 'uniqid';
import PDFMerger from 'pdf-merger-js';
import dotenv from 'dotenv';

import { caseFile, newCase, uploadCase, UploadedFileCase } from './types';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3/YStorageUploadFile';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.put(
  '/case/new',
  async (req: Request<unknown, unknown, uploadCase, unknown>, res) => {
    const uploadCaseData = req.body;
    const caseName = uploadCaseData.name;
    const newId = uniqid(caseName);
    const dateCreated: string = new Date().toLocaleString('ru');

    const caseParams: newCase = {
      id: newId,
      ...uploadCaseData,
      created: dateCreated,
    };

    await access('./db/cases.json')
      .then(async () => {
        await addNewCase(caseParams);

        res.end();
      })
      .catch(async () => {
        await writeFile('./db/cases.json', '[]');
        await addNewCase(caseParams);

        res.end();
      });
  }
);

app.get('/case/list', async (req, res) => {
  const caseList = await readFile('./db/cases.json', 'utf-8');
  const caseListToJson: JSON = JSON.parse(caseList);

  res.json(caseListToJson);

  res.end();
});

app.get('/file/get', async (req, res) => {
  const caseId = req.query.id;

  if (!caseId) {
    throw new Error('Cases not found');
  }

  const files = await readFile('./db/casesFiles.json', {
    encoding: 'utf-8',
  });

  const filesList: Array<caseFile> = JSON.parse(files);

  const filesCase = filesList
    .filter((file) => file.caseId === String(caseId))
    .map((file) => ({
      id: file.id,
      name: file.files.docx,
    }));

  res.json(filesCase);

  res.end();
});

app.post(
  '/file/upload',
  async (req: Request<unknown, unknown, UploadedFileCase>, res) => {
    const uploadFile = req.files;
    const caseId = req.body.id;

    if (!uploadFile || Object.keys(uploadFile).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    if (!caseId) {
      throw new Error('Case not found');
    }

    console.log(req.body.id);

    const sampleFile = uploadFile.file as UploadedFile;
    const [fileName, fileExtension] = sampleFile.name.split('.');

    if (Array.isArray(sampleFile)) {
      throw new Error('Error: Upload single file');
    }

    const uploadPath = './' + sampleFile.name;

    const fileToBinary = new Uint8Array(sampleFile.data);
    const file = new File([fileToBinary], sampleFile.name, {
      type: sampleFile.mimetype,
    });

    sampleFile.mv(uploadPath, async function (error) {
      if (error) {
        return res.status(500).send(error);
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

      const setNewFileParams: caseFile = {
        id: sampleFile.md5,
        caseId: caseId,
        files: {
          docx: `${fileName}.docs`,
          pdf: `${fileName}.pdf`,
        },
      };

      await access('./db/casesFiles.json')
        .then(async () => {
          await setNewFile(setNewFileParams);
        })
        .catch(async () => {
          await writeFile('./db/casesFiles.json', '[]');
          await setNewFile(setNewFileParams);
        });

      await s3Upload(file);
      await s3Upload(pdfFile);

      await unlink(uploadPath);
      await unlink(pdfFileLink);

      res.send('File uploaded!');

      res.end();
    });
  }
);

app.get(
  '/file/download',
  async (req: Request<unknown, unknown, string>, res) => {
    const fileName: string = String(req.query.fileName);

    if (!fileName) {
      throw new Error('file not found');
    }

    res.json({ link: s3Download(fileName) });

    res.end();
  }
);

app.get('/file/merge', async (req, res) => {
  const caseId = req.query.id;

  if (!caseId) {
    throw new Error('Files not found');
  }

  const files = await readFile('./db/casesFiles.json', {
    encoding: 'utf-8',
  });

  const filesList: Array<caseFile> = JSON.parse(files);
  const filesCases = filesList.filter((file) => file.caseId === caseId);

  const merger = new PDFMerger();

  for (const files of filesCases) {
    const pdfFileName = files.files.pdf;

    const command = new GetObjectCommand({
      Bucket: 'test-cases',
      Key: pdfFileName,
    });

    const response = await s3.send(command);
    const body = response.Body as AsyncIterable<Buffer>;

    const chunks = [];

    for await (const chunk of body) {
      chunks.push(chunk);
    }

    const fileBuffer = Buffer.concat(chunks);

    await merger.add(fileBuffer);
  }

  await merger.save('merged.pdf');

  res.end();
});

export { app };
