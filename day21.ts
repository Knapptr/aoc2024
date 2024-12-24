import { dir } from "console";
import coordToString from "./helpers/coordToString";
import { readInput } from "./readInput";

const numberPad = [
    ["-1","0","A"],
    ["1","2","3"],
    ["4","5","6"],
    ["7","8","9"]
]

const dirPad = [
    ["<", "V", ">"],
    ["-1", "^", "A"],
]

type Coord = [number,number];
interface ButtonBot{
    pad: string[][];
    currentCoord: Coord
    dfsFind(char:string, debug?:boolean):string[];
}

const isInBounds = (arr:any[][], coord:Coord):boolean =>{
    return coord[0] >= 0 && coord[0] < arr.length && coord[1] >=0 && coord[1] < arr[0].length;
}

const deltas: [Coord,string][] = [
    [[0,1], ">"],
    [[0,-1], "<"],
    [[1, 0],"^"],
    [[-1, 0],"V"]
];

const createBot= (pads:string[][], initPosition:Coord): ButtonBot =>{
return {
    pad: pads,
    currentCoord: initPosition,
    dfsFind(char, debug = false) {
        const queue:[Coord,string[]][] = [[this.currentCoord,["A"]]];
        const commands:string[] = []
            const visited = new Set;
        while (queue.length > 0){
            let [[y,x],commandHistory] = queue.shift()!;
            // check if cell is the right cell
            visited.add(coordToString([y,x]));
            if(this.pad[y][x] === "-1"){continue};
            if(debug){
                console.log({y,x,atPad:this.pad[y][x], char});
            }
            if(this.pad[y][x] === char){commands.push(...commandHistory);this.currentCoord = [y,x]; return commands};
            const nbors = deltas.map(([[dy,dx],dir]):[Coord,string]=> [[y+dy,x+dx],dir]).filter(c=> isInBounds(this.pad, c[0]) && !visited.has(coordToString(c[0])));
            // console.log({nbors});
            nbors.forEach(([c,dir])=>{
                queue.push([c,[...commandHistory,dir]])
            })
        }
        throw new Error("Not findable")

    }
}
}


const solve = (input:string):number=>{

    const numberBot = createBot(numberPad,[0,2]);
    const padBot1 = createBot(dirPad, [1,2]);
    const padBot2 = createBot(dirPad, [1,2]);
    const desired = input;
    const presses = desired.split("").map(c=> numberBot.dfsFind(c).toReversed().toSorted((a,b)=> {if(a === "A"){return Infinity}else{return b.charCodeAt(0)-a.charCodeAt(0)}}));
    // console.log({p1: presses.flat().join("")});
    const press2 = presses.map(pa=>pa.map(p=>padBot1.dfsFind(p).toReversed().toSorted((a,b)=> {if(a === "A"){return Infinity}else{return b.charCodeAt(0)-a.charCodeAt(0)}}))).flat();
    // console.log({p2: press2.flat().join("")});
    const presses3 = press2.map(pa=> pa.map(p=>padBot2.dfsFind(p).toReversed())).flat();
    console.log({p3: presses3.flat().join("")});
    const complexity = presses3.flat().join("").length * parseInt(input);
    return complexity
}

const main = async () =>{
    const input = await readInput("./inputs/21.test.txt");
    let sum = 0;
    for (const code of input.trim().split("\n")){
        sum += solve(code);
    }
    console.log({sum});
}
main();



