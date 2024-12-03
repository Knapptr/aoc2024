"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readInput_1 = require("./readInput");
const inputPath = "./inputs/2.test.txt";
const parseToReports = async () => {
    const reports = [];
    const input = await (0, readInput_1.readInput)(inputPath);
    const lines = input.trim().split("\n");
    for (const line of lines) {
        const nums = line.split(" ").map(i => Number.parseInt(i));
        reports.push(nums);
    }
    return reports;
};
/*

    The levels are either all increasing or all decreasing.
    Any two adjacent levels differ by at least one and at most three.
*/
const testDeltaDirection = (lhs, rhs) => {
    if (lhs > rhs) {
        return "DEC";
    }
    if (lhs < rhs) {
        return "INC";
    }
    return "NONE";
};
const testDelta = (lhs, rhs) => {
    const diff = Math.abs(lhs - rhs);
    if (diff < 1) {
        return false;
    }
    if (diff <= 3) {
        return true;
    }
    return false;
};
const testSafe = (report) => {
    // check for delta
    const initialDelta = testDeltaDirection(report[0], report[1]);
    if (initialDelta === "NONE") {
        return false;
    }
    let li = 0;
    while (li < report.length - 1) {
        const ri = li + 1;
        const lhs = report[li];
        const rhs = report[ri];
        if (testDeltaDirection(lhs, rhs) !== initialDelta) {
            return false;
        }
        // check delta is in range
        if (!testDelta(lhs, rhs)) {
            return false;
        }
        li++;
    }
    return true;
};
const testSafePart2 = (report) => {
    if (!testSafe(report)) {
        for (let i = 0; i < report.length; i++) {
            if (testSafe(report.toSpliced()))
                ;
        }
    }
};
const testLevelsPart1 = (reports) => {
    let safeCount = 0;
    // iterate through each report
    for (const report of reports) {
        const result = testSafe(report);
        console.log("Testing: ", { report }, { result });
        if (result) {
            safeCount += 1;
        }
    }
    return safeCount;
};
const testLevelsPart2 = (reports) => {
    let safeCount = 0;
    // iterate through each report
    for (const report of reports) {
        const result = testSafePart2(report);
        console.log("Testing: ", { report }, { result });
        if (result) {
            safeCount += 1;
        }
    }
    return safeCount;
};
const main = async () => {
    const reports = await parseToReports();
    const safeCount = testLevelsPart1(reports);
    console.log({ "Part One": safeCount });
    const safeCount2 = testLevelsPart2(reports);
    console.log({ "Part Two": safeCount2 });
};
main();
