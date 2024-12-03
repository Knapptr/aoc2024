"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readInput = void 0;
const promises_1 = require("fs/promises");
const readInput = async (filePath) => {
    const fileString = await (0, promises_1.readFile)(filePath, "utf8");
    return fileString;
};
exports.readInput = readInput;
