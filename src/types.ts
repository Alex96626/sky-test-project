import { UploadedFile } from "express-fileupload";

export type CaseData = {
  id: string,
  name: string,
  created: string;
};

export type CaseList = CaseData[];

export type UploadCase = Omit<CaseData, 'id' | 'created'>;

type fileData = {
  fileName: string,
  md5: string
}

export type fileExtension = {
  docx: fileData,
  pdf?: fileData
}

export type CaseFile = {
  id: string;
  caseId: string
  files: fileExtension;
};

export type ReturnedFile = {
  id: string,
  name: string
};

export type ReturnedFileList = ReturnedFile[];

export type UploadedFileCase = { 
  id: string; 
  file: UploadedFile 
}
