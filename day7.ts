import {readInput}  from "./readInput";

type Operation = "+" | "*" | "||";
const performOp = (op:Operation,lhs:number,rhs:number):number =>{
    switch (op){
            case "+": return lhs + rhs;
            case "*": return lhs * rhs;
            case "||": return parseInt(`${lhs}${rhs}`)
    }
}
const parseInput = async (inputPath:string):Promise<Equation[]>=>{
    const input = await readInput(inputPath);
    const lines = input.trim().split("\n");
    return lines.map(line=>{
        const [resultString,others] = line.split(":");
        const result =  parseInt(resultString);
        const nums = others.trim().split(" ").map(s=>parseInt(s));
        return new Equation(result,nums)
    })
}
class Equation{
    result: number;
    numbers: number[]

    /** Numbers should be reversed so that wwhen removing from stack they work! **/
    constructor(result:number,numbers:number[]){
        this.result = result;
        this.numbers  = numbers;
    }

    checkPossible(operations:Operation[],numbers:number[] = this.numbers): boolean {
        // Base Case:
        if(numbers.length === 1){
            return numbers.pop()! === this.result;
        }
        // clone ops and number for mutation
        const ops = [...operations];
        const nums = [...numbers];
        // perform operation for each remaining op
        while(ops.length > 0){
            const curOp = ops.pop()!;
            // take two numbers from numbers
            const [lhs,rhs] = [nums[0],nums[1]];
            // perform op
            const result = performOp(curOp,lhs,rhs);
            // put result into numms and run again
            const updatedNums = [result,...nums.slice(2)];
            // console.log(lhs,curOp,rhs,'=',result, {updatedNums});
            if(this.checkPossible(operations,updatedNums)){return true;}
            
        }
        return false
    }
}
const main = async () =>{
    const equations = await parseInput("./inputs/7.txt");
    const sums = equations.filter(e=>e.checkPossible(["+",'*'])).reduce((acc,e)=>acc + e.result,0);
    const sums2 = equations.filter(e=>e.checkPossible(["+","*","||"])).reduce((acc,e)=>acc + e.result,0);
    console.log({Part1: sums});
    console.log({Part2: sums2});
}

main();
