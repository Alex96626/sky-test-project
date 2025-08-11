export type uploadCase = {
  name: string,
  created: string;
  dateCreated: Date;
  fileSize: number;
}

export type newCase = {
  id: string,
  name: string,
  created: string;
  dateCreated: Date;
  fileSize: number;
};

export type fileExtension = {
  docx: string,
  pdf: string
}

export type caseFile = {
  id: string;
  caseId: string
  files: fileExtension;
};
