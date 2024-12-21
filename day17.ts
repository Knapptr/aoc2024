import { writeFile } from "fs";
import {readInput} from "./readInput";

interface Machine {
    registerA: bigint;
    registerB: bigint;
    registerC: bigint;
    code: number[]
    output:  number[];
    instructionPointer: number;
    readPointer():number;
    getOperand():number;
    advancePointer():void;
    history: { opcode:number, operand:number, registerA:bigint,registerB:bigint,registerC:bigint}[]
        /** returns  true if operation success, false if not*/
    operate():boolean
}

const initMachine = (registerA:bigint,registerB:bigint,registerC:bigint,code:number[],instructionPointer:number = 0):Machine =>{
    return {
        registerA,
        registerB,
        registerC,
        code,
        output: [],
        history: [],
        instructionPointer: 0,
        readPointer(){
            return this.code[this.instructionPointer];
        },
        getOperand() {
            return this.code[this.instructionPointer + 1];
        },
        advancePointer() {
            this.instructionPointer += 2
        },
        operate(){
            if(this.instructionPointer >= code.length){return false}
            const currentOperation = this.readPointer();

            this.history.push({registerA:this.registerA,registerB:this.registerB,registerC:this.registerC, opcode: currentOperation, operand: this.getOperand()})

            switch (currentOperation){
                case 0: adv(this); return true;
                case 1: bxl(this); return true;
                case 2: bst(this); return true;
                case 3: jnz(this); return true;
                case 4: bxc(this); return true;
                case 5: out(this); return true;
                case 6: bdv(this); return true;
                case 7: cdv(this); return true;
                default: throw new Error("Error with machine orperation")
            }
        }
    }
    
}

const readComboOperand = (op:number,machine:Machine):bigint=> {
    if(op < 4) {return BigInt(op)}
    switch (op){
        case 4: return machine.registerA;
        case 5: return machine.registerB;
        case 6: return machine.registerC;
        case 7: throw new Error("Use of reserved operand")
        default: throw new Error("Unknown Operand")
    }
}

/** OPCODE 0 */
const adv = (machine:Machine):void =>{
   const num = machine.registerA; 
   const denom= BigInt(Math.pow(2,Number(readComboOperand(machine.getOperand(),machine))));
    const result = BigInt(Math.floor(Number(num / denom)));
    machine.registerA = BigInt(result);
    machine.advancePointer() 
}

/** OPCODE 1 */
const bxl = (machine:Machine):void =>{
 const result = machine.registerB ^ BigInt(machine.getOperand())
    machine.registerB = result;
    machine.advancePointer()
}

/** OPCODE 2 */
const bst = (machine: Machine):void => {
    const op = readComboOperand(machine.getOperand(),machine);
    machine.registerB = op % BigInt(8);
    machine.advancePointer();
}

/** OPCODE 3 */
const jnz = (machine: Machine):void =>{
    if(Number(machine.registerA) === 0){
        machine.advancePointer();
        return;}
    machine.instructionPointer = machine.getOperand()
}

/** OPCODE 4 */
const bxc = (machine: Machine):void =>{
    machine.registerB = machine.registerB ^ machine.registerC
    machine.advancePointer();
}

/** OPCODE 5 */
const out = (machine:Machine):void =>{
    const op = readComboOperand(machine.getOperand(),machine);
    // console.log("\t",{outputting: op % 8, atPoint: machine.instructionPointer});
    machine.output.push(Number(op) % 8);
    machine.advancePointer();
}

/** OPCODE 6 */
const bdv = (machine:Machine):void =>{
   const num = machine.registerA; 
   const denom = Math.pow(2,Number(readComboOperand(machine.getOperand(),machine)));
    const result = Math.floor(Number(num) / denom);
    machine.registerB = BigInt(result);
    machine.advancePointer() 
}

/** OPCODE 7 */
const cdv = (machine:Machine):void =>{
   const num = Number(machine.registerA);
   const denom = Math.pow(2,Number(readComboOperand(machine.getOperand(),machine)));
    const result = Math.floor(num / denom);
    machine.registerC = BigInt(result);
    machine.advancePointer() 
}

const machineFromInput = (input:string):Machine =>{
    const lines  = input.trim().split("\n");
    const rA = BigInt(parseInt(lines[0].split(":")[1].trim()));
    const rB = BigInt(parseInt(lines[1].split(":")[1].trim()));
    const rC = BigInt(parseInt(lines[2].split(":")[1].trim()));
    const code = lines[4].split(":")[1].trim().split(",").map(c=>parseInt(c));
    return initMachine(rA,rB,rC,code);
}

const cloneMachine = (machine:Machine):Machine =>{
    return {
        ...machine,
        output: [...machine.output],
        code: [...machine.code]

    }
}

const p1 = (input: string):string=>{
    const machine = machineFromInput(input);
    while(machine.operate()){
    };
    return machine.output.join();
    }

const investigate = (input:string ):number =>{
    let machine = machineFromInput(input);
    const desired = [2,4,1,7,7,5,4,1,1,4,5,5,0,3,3];
    const originalMachine = cloneMachine(machine);
    machine.registerA = BigInt(3); // 3 outputs a 0
    let last_success = [3];
    for (let d = -1; d > -16; d--){
            let currentSuccesses = [];
        for (let i = 0; i <= 8; i++){
            for(const potential of [...last_success]){
                let currentValue = (potential * 8) + i;
               machine = cloneMachine(originalMachine);
                machine.registerA = (BigInt(currentValue));
                console.log("running for length", d * -1 );
            while(machine.output.length < 1){
                machine.operate();
                }
            if(machine.output.at(0) === desired.at(d)){
                currentSuccesses.push(currentValue);
                console.log({last_success});
            console.log(machine.output);
        }
        }
    }
    console.log(currentSuccesses);
            last_success = [...currentSuccesses];
            currentSuccesses = [];
        }
    return last_success.sort()[0];
}

const main = async () => {
    const  input = await readInput("./inputs/17.txt");
    // let p2 = investigate(input);
    // console.log({p2});
    const r1 = p1(input);
    console.log({part1: r1});

    // const r2 = p2(input);
    // console.log({p2:r2});
    // for (let i =  8; i < 32768; i ++){
    //     let machine = machineFromInput(input);
    //     const savedMachine = cloneMachine(machine);
    //     machine.registerA = i;
    //     while(machine.operate()){
    //         if(machine.output[0] === 2 && machine.output[1] === 4 && machine.output[2] ===1 && machine.output[3] === 7 ){ console.log(i)}
    //     }
    //     machine = cloneMachine(savedMachine);

        
        
    // }
}


main();
