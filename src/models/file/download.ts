import { s3Download } from "../../s3/download"

export const download = (fileName: string) => {
    return s3Download(fileName)
}