import {readInput} from './readInput';

type WordSearch = string[][];

const inputPath = "./inputs/4.txt";

const parse = async ():Promise<WordSearch> => {
    const inputString = await readInput(inputPath);
    const lines = inputString.trim().split("\n");
    return lines.map(l=>l.split(""));
}

interface SearchStackFrame{
    char: ValidLetter
        ri: number,
        chari: number,
        direction: Direction
}

interface XSearchStackFrame{
        char: ValidLetter
        ri: number,
        chari: number,
}

type ValidLetter = "X" | "M" | "A" |"S";
const nextLetter = {
    "X": "M",
    "M": "A",
    "A": "S",
    "S": "" // done
}
type Direction = "UP" | "DOWN"| "LEFT" | "RIGHT" | "DUPL" | "DUPR" | "DDOWNL" | "DDOWNR";
const directions: Direction[] = ["UP" , "DOWN", "LEFT" , "RIGHT" , "DUPL" , "DUPR" , "DDOWNL" , "DDOWNR" ];
const dirCoordDict = {
"UP": [-1,0],
"DOWN": [+1,0],
"LEFT": [0,-1],
"RIGHT": [0,+1],
"DUPL": [-1,-1],
"DUPR": [-1,+1],
"DDOWNL": [+1,-1],
"DDOWNR": [+1,+1],
}

const dirCoords = (currentSearch: SearchStackFrame): number[] =>{
    const [drow,dcol] = dirCoordDict[currentSearch.direction];
    const targetRow = currentSearch.ri + drow;
    const targetCol = currentSearch.chari + dcol;
    return [targetRow,targetCol];
}

const search = (input:WordSearch):number=>{
    const rowCount = input.length;
    const colCount = input[0].length;

    const stack: SearchStackFrame[] = [];

    input.forEach((row,ri)=>{row.forEach((char,chari)=>{
        if(char === 'X'){
            directions.forEach(direction=>{ stack.push({char,ri,chari,direction})})
            }})
    })

    let xmasCount = 0;

    while (stack.length > 0 ) {
        const currentSearch = stack.pop()!;
        if(currentSearch.char === "S"){ xmasCount+=1; continue;}
        const [targetRow, targetCol] = dirCoords(currentSearch);
        if (targetRow >= 0 && targetRow < rowCount){
            if(targetCol >=0 && targetCol < colCount){
                // this is a valid search, check if its the right char
                const neededLetter = nextLetter[currentSearch.char];
                
                if (input[targetRow][targetCol] === neededLetter){
                    stack.push(
                        {char:neededLetter as ValidLetter, ri: targetRow,chari:targetCol,direction: currentSearch.direction}
                    )
                }
            }
        }
    }
    return xmasCount;
}

const xSearch = (input: WordSearch): number =>{
    const roCount = input.length;
    const colCount = input[0].length;

    const stack: XSearchStackFrame[]  = [];
    const seenCoords: Set<number[]> = new Set;
    let count = 0;

    input.forEach((row,ri)=>{row.forEach((char,chari)=>{
        if(char === "A"){
            stack.push({char,ri,chari})
            seenCoords.add([ri,chari]);
        }
    })})
    while (stack.length > 1){
        const currentCenter = stack.pop()!;
        // check upperLeft Neighbor for M or S
        const [upperLeftRowI, upperLeftColI ]= dirCoords({direction: "DUPL",...currentCenter});
        const [lowerLeftRowI, lowerLeftColI ]= dirCoords({direction: "DDOWNL",...currentCenter});
        const [upperRightRowI, upperRightColI]= dirCoords({direction: "DUPR",...currentCenter});
        const [lowerRightRowI, lowerRightColI ]= dirCoords({direction: "DDOWNR",...currentCenter});

        if (upperLeftRowI <0 || upperLeftRowI >= roCount){continue;}
        if (upperLeftColI <0 || upperLeftColI >= colCount){continue;}
        if (lowerLeftRowI <0 || lowerLeftRowI >= roCount){continue;}
        if (lowerLeftColI <0 || lowerLeftColI >= colCount){continue;}
        if (upperLeftRowI <0 || upperLeftRowI >= roCount){continue;}
        if (upperLeftColI <0 || upperLeftColI >= colCount){continue;}
        if (lowerLeftRowI <0 || lowerLeftRowI >= roCount){continue;}
        if (lowerLeftColI <0 || lowerLeftColI >= colCount){continue;}
        if (upperRightRowI <0 || upperRightRowI >= roCount){continue;}
        if (upperRightColI <0 || upperRightColI >= colCount){continue;}
        if (lowerRightRowI <0 || lowerRightRowI >= roCount){continue;}
        if (lowerRightColI <0 || lowerRightColI >= colCount){continue;}

        const upperLeftChar = input[upperLeftRowI][upperLeftColI];
        const upperRightChar = input[upperRightRowI][upperRightColI];
        const lowerRightChar = input[lowerRightRowI][lowerRightColI];
        const lowerLeftChar = input[lowerLeftRowI][lowerLeftColI];

        if (( upperLeftChar === "M" && lowerRightChar === "S" ) || (upperLeftChar === "S" && lowerRightChar === "M")){
            if(( upperRightChar === "M" && lowerLeftChar ==="S" ) || (upperRightChar === "S" && lowerLeftChar === "M")){
                count += 1;
            }
        }
    }
    return count;
}

const main = async () =>{
    const parsedOne = await parse();
    const resultOne = search(parsedOne);
    console.log("Part 1: ", {result: resultOne});
    const resultTwo = xSearch(parsedOne);
    console.log("Part 2: ", {result: resultTwo});
}

main();
