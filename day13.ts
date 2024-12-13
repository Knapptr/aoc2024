import {readInput} from "./readInput";

const ACOST = 3;
const BCOST = 1;

type Coord = [number,number];

interface Machine {
    a: Button,
    b: Button,
    prize: Coord
}

interface Button{
    cost: number;
    x: number;
    y: number
}

const createA = (x:number,y:number):Button =>{
    return {x,y,cost:ACOST}
}
const createB = (x:number,y:number):Button =>{
    return {x,y,cost:BCOST}
}

/** Return [x,y] deltas */
const parseMachineString = (input:string): [number,number] => {
    const [_,moveS] = input.split(":");
    const [xMovS,yMovS] = moveS.split(",").map(s=>s.trim()) // "X+65", "Y+11"
    const x = parseInt(xMovS.slice(1));
    const y = parseInt(yMovS.slice(1));
    return  [x,y];
}

const parsePrizeString = (input:string): Coord =>{
    const [_,coordS] = input.split(":").map(s=>s.trim());
    const [xS,yS] = coordS.split(",").map(s=>s.trim()) // "X+65", "Y+11"
    const x = parseInt(xS.slice(2));
    const y = parseInt(yS.slice(2));
    return [x,y];
}
const parse = (input:string): Machine[]=>{
    return input.trim().split("\n\n").map(mString => {
       const [aS,bS,pS] = mString.split("\n");
        const a = createA(...parseMachineString(aS));
        const b = createB(...parseMachineString(bS));
        const prize = parsePrizeString(pS);

        return {a,b,prize}
    })
    
}
const move = (coord:Coord,delta: Coord): Coord =>{
    return [coord[0] + delta[0], coord[1] + delta[1]]
}
const tryMoves = (coord:Coord,machine:Machine,costAcc: number[] = [],currentCost:number = 0): boolean => {
    console.log({coord});
    // base case fail
    if(coord[0] > machine.prize[0] || coord[1] > machine.prize[1]){return false}
    // base case success
    if (coord[0] === machine.prize[0] && coord[1] === machine.prize[1]){
        return true
    }
    // try A
    const afterA = move(coord,[machine.a.x,machine.a.y]);
    
    if(tryMoves(afterA,machine,costAcc,currentCost + machine.a.cost)){
        costAcc.push(currentCost + machine.a.cost)
    }
    // try B
    const afterB = move(coord,[machine.b.x,machine.b.y]);
    
    if(tryMoves(afterB,machine,costAcc,currentCost + machine.b.cost)){
        costAcc.push(currentCost + machine.b.cost)
    }
    return false // this should be unreachable
     
}
const p1BruteForce = (machines:Machine[]):number => {
    const costs = []
    for (const machine of machines){
        const machineCosts: number[] = [];
        tryMoves([0,0], machine, machineCosts);
        if(machineCosts.length > 0){
            costs.push(Math.min(...machineCosts));
        }
    }
    return costs.reduce((acc,cv)=> cv + acc);
}

const main = async ()=>{
    const input = await readInput("./inputs/13.test.txt");
    const machines = parse(input);
    const p1 = p1BruteForce(machines);
    console.log({p1});
}

main();
