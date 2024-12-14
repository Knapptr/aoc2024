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

const parsePrizeString = (input:string,offset:number = 0): Coord =>{
    const [_,coordS] = input.split(":").map(s=>s.trim());
    const [xS,yS] = coordS.split(",").map(s=>s.trim()) // "X+65", "Y+11"
    const x = parseInt(xS.slice(2)) + offset;
    const y = parseInt(yS.slice(2)) + offset;
    return [x,y];
}
const parse = (input:string, offset:number= 0): Machine[]=>{
    return input.trim().split("\n\n").map(mString => {
       const [aS,bS,pS] = mString.split("\n");
        const a = createA(...parseMachineString(aS));
        const b = createB(...parseMachineString(bS));
        const prize = parsePrizeString(pS, offset);

        return {a,b,prize}
    })
    
}
const move = (coord:Coord,delta: Coord): Coord =>{
    return [coord[0] + delta[0], coord[1] + delta[1]]
}
/* MATH ZONE
n = number of machine b
n = (py * ax) - (ay * px)
    ---------------------
    by * ax - by * ay
*/
const findCheapestWin  = (machine:Machine): number =>{
    const a = machine.a;
    const b = machine.b;
    const [pX, pY] = machine.prize;

    const n = Math.floor(((pY * a.x) - (a.y * pX)) /( (b.y * a.x) - (b.x * a.y)));
    const m = Math.floor((pX - b.x * n ) / a.x);

    // check that adds to coords
    if ((a.x * m + b.x * n === pX) && (a.y * m + b.y * n === pY)){
        return a.cost * m + b.cost * n
    }else{
        return -1
    }
}
const solve = (machines:Machine[]):number => {
    const costs = [];
    for (const machine of machines){
       const cheapest = findCheapestWin(machine) ;
        if (cheapest !== -1){
            costs.push(cheapest);
        }
    }
    return costs.reduce((acc,c)=> acc + c, 0);
}


const main = async ()=>{
    const input = await readInput("./inputs/13.txt");
    const machines = parse(input);
    const p1 = solve(machines);
    console.log({p1});
    const machines2 = parse(input,10000000000000);
    const p2 = solve(machines2);
    console.log({p2});
}

main();
