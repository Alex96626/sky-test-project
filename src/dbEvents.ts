import { promises as fs } from "fs";
import { caseFile, newCase } from "./types";

export const setNewFile = async (data: caseFile) => {
  let fileData = await fs.readFile("./db/casesFiles.json", "utf8");
  const currentFileData = JSON.parse(fileData);
  currentFileData.push(data);
  console.log(currentFileData)
  fs.writeFile("./db/casesFiles.json", JSON.stringify(currentFileData));
}

export const addNewCase = async (params: newCase) => {
  let fileData = await fs.readFile("./db/cases.json", "utf8");

  const currentFileData = JSON.parse(fileData);

  currentFileData.push(params);

  fs.writeFile("./db/cases.json", JSON.stringify(currentFileData));
};