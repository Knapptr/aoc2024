import { readFile } from "fs/promises"
export const readInput = async (filePath: string): Promise<string> => {
    const fileString = await readFile(filePath, "utf8");
    return fileString;
}
