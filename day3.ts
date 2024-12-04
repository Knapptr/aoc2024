import {readInput} from "./readInput";

const inputPath = "./inputs/3.txt";

interface Mul{
    lhs: number;
    rhs: number;
}
interface ParseResult<T>{ 
    parsed: T | null;
    remaining: string
}
type DoDont = "DO"|"DONT";

const parseMul = (input:string):ParseResult<Mul> =>{
    if (input[0] !== "m"){
        return {parsed:null,remaining: input.slice(1)}
    }

    let stack: (number | string)[]  = ["m"];
    let parsed: Mul | null = null;
    let i = 1;

    outer:
    while (i < input.length){
        let char = input[i];

        if (stack.length === 1){
            if (char === "u"){
                stack.push("u");
                i++;
                continue;
            }else{
                break;
            }
        }

        if (stack.length === 2){
            if (char === "l"){
                stack.push("l");
                i++;
                continue;
            }else{break;};
        }

        if (stack.length === 3){
            if (char === "("){
                stack.push("(");
                i++;
                continue;
            }else{break;};
        }

        if (stack.length === 4){
            // We have arrived where lhs number should be.
            // Iterate until reaching a comma or invalid input
            let numberString = "";
            inner:
            while (i < input.length){
                char = input[i]; // Redeclare for interior loop
                if (!isNaN(parseInt(char))){
                    // digit of a number, add it to the number string
                    numberString += char;
                    i++;
                    continue inner;
                }else{
                if (char === "," && numberString.length > 0 ){
                   // end of number input, push number and comma to stack 
                    const number = parseInt(numberString);
                    stack.push(number,",");
                    i++;
                    break inner;
                }else{ // Invalid, move on
                    break outer;
                }
            }
        }
            // continue
    }

        if (stack.length === 6){
            // We have arrived where rhs number should be.
            // Iterate until reaching a ) or invalid input
            let numberString = "";
            while (i < input.length){
                char = input[i]; // Redeclare for interior loop
                if (!isNaN(parseInt(char))){
                    // digit of a number, add it to the number string
                    numberString += char;
                    i++;
                }else{
                if (char === ")" && numberString.length > 0 ){
                   // end of number input, push number and parens to stack 
                    const number = parseInt(numberString);
                    stack.push(number,")");
            // Valid- assign to parsed
                parsed =  {
                    lhs: stack[4] as number,
                    rhs: stack[6] as number
                };
            i++;
            break outer;
            }else{ // Invalid 
                break outer;
                }
            }
                // continue;
        }
    }

}
    return {parsed, remaining: input.slice(i)}
}


const parseDoDont = (input:string):ParseResult<DoDont> =>{
    let parsed: DoDont|null = null;

    // not a do/dont. Move on
    if (input[0] !== "d"){return {parsed,remaining: input}}
    
    const stack = ["d"];
    let i = 1;

    while (i  < input.length){
        const char = input[i];
        if (stack.length === 1){
            if(char === 'o'){ stack.push('o'); i++; continue;}else{break;}
        }
        if (stack.length === 2){
            if(char === 'n'){ stack.push('n'); i++; continue;}
            if(char === '('){stack.push('('); i++; continue;}
            break;
        }
        if (stack.length == 3){
            if(char === '\''){ stack.push('\''); i++; continue;}
            if(char === ')' && stack.at(-1) === '('){ parsed = "DO"; i++; break;}
        }
        if (stack.length == 4){
            if(char === 't'){ stack.push('t'); i++; continue;}else{break;}
        }
        if (stack.length == 5){
            if(char === '('){ stack.push('('); i++; continue;}else{break;}
        }
        if (stack.length == 6){
            if(char === ')'){
                parsed = "DONT";
                i++;
                break;
            }else{break;}
        }
    }

    const result = {parsed,remaining: input.slice(i)}
    return result;
}

const parseOne = async (): Promise<Mul[]> =>{
    const inputString = await readInput(inputPath);
    let muls:Mul[] = [];

    let currentInput = inputString;
    while (currentInput.length > 0){
        const result = parseMul(currentInput);
        currentInput = result.remaining;
        if (result.parsed !== null){muls.push(result.parsed)}
    }
return muls;
}
const parseTwo = async (): Promise<Mul[]> =>{
    const inputString = await readInput(inputPath);
    let muls:Mul[] = [];

    let currentInput = inputString;
    let state:DoDont = "DO";

    while (currentInput.length > 0){
        const ddResult = parseDoDont(currentInput);
        if (ddResult.parsed !== null){state = ddResult.parsed};
        currentInput = ddResult.remaining;
        if (state === "DO"){
            const mulResult = parseMul(currentInput);
            if (mulResult.parsed !== null){muls.push(mulResult.parsed)}
            currentInput = mulResult.remaining;
        }else{ currentInput = currentInput.slice(1)}
    }
return muls;
}

const main = async () => {
    // Part 1
    const mulsOne = await parseOne();
    // get sum
    const sumOne = mulsOne.reduce((acc,cv)=>{
        acc += (cv.lhs * cv.rhs);
        return acc;
    },0);

    console.log("Part 1: ", {sum: sumOne});

    // Part 2
    const mulsTwo = await parseTwo();
    // get sum
    const sumTwo = mulsTwo.reduce((acc,cv)=>{
        acc += (cv.lhs * cv.rhs);
        return acc;
    },0);

    console.log("Part 2: ", {sum: sumTwo});
}

main();

