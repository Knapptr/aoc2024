import {readInput} from "./readInput";

interface Machine {
    registerA: number;
    registerB: number;
    registerC: number;
    code: number[]
    output:  number[];
    instructionPointer: number;
    readPointer():number;
    getOperand():number;
    advancePointer():void
        /** returns  true if operation success, false if not*/
    operate():boolean
}

const initMachine = (registerA:number,registerB:number,registerC:number,code:number[]):Machine =>{
    return {
        registerA,
        registerB,
        registerC,
        code,
        output: [],
        instructionPointer: 0,
        readPointer(){
            return this.code[this.instructionPointer]
        },
        getOperand() {
            return this.code[this.instructionPointer + 1]
        },
        advancePointer() {
            this.instructionPointer += 2
        },
        operate(){
            if(this.instructionPointer >= code.length){return false}
            const currentOperation = this.readPointer();

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

const readComboOperand = (op:number,machine:Machine):number=> {
    if(op < 4) {return op}
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
   const denom = Math.pow(2,readComboOperand(machine.getOperand(),machine));
    const result = Math.floor(num / denom);
    machine.registerA = result;
    machine.advancePointer() 
}

/** OPCODE 1 */
const bxl = (machine:Machine):void =>{
 const result = machine.registerB ^ machine.getOperand()
    machine.registerB = result;
    machine.advancePointer()
}

/** OPCODE 2 */
const bst = (machine: Machine):void => {
    const op = readComboOperand(machine.getOperand(),machine);
    machine.registerB = op % 8;
    machine.advancePointer();
}

/** OPCODE 3 */
const jnz = (machine: Machine):void =>{
    if(machine.registerA === 0){
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
    machine.output.push(op % 8);
    machine.advancePointer();
}

/** OPCODE 6 */
const bdv = (machine:Machine):void =>{
   const num = machine.registerA; 
   const denom = Math.pow(2,readComboOperand(machine.getOperand(),machine));
    const result = Math.floor(num / denom);
    machine.registerB = result;
    machine.advancePointer() 
}

/** OPCODE 7 */
const cdv = (machine:Machine):void =>{
   const num = machine.registerA; 
   const denom = Math.pow(2,readComboOperand(machine.getOperand(),machine));
    const result = Math.floor(num / denom);
    machine.registerC = result;
    machine.advancePointer() 
}

const machineFromInput = (input:string):Machine =>{
    const lines  = input.trim().split("\n");
    const rA = parseInt(lines[0].split(":")[1].trim());
    const rB = parseInt(lines[1].split(":")[1].trim());
    const rC = parseInt(lines[2].split(":")[1].trim());
    const code = lines[4].split(":")[1].trim().split(",").map(c=>parseInt(c));
    return initMachine(rA,rB,rC,code);
}

const p1 = (input: string):string=>{
    const machine = machineFromInput(input);
    while(machine.operate()){
        // console.log({machine})
    };
    return machine.output.join();
    }

const main = async () => {
    const  input = await readInput("./inputs/17.txt");
    const r1 = p1(input);
    console.log({part1: r1});
}


main();
