import coordToString from "./helpers/coordToString";
import {readInput} from "./readInput";

interface Coord {
    x: number;
    y: number;
    getNeigbors(): Coord[]

}

const deltas =[
    [1,0],
    [-1,0],
    [0,1],
    [0,-1]
];
const createCoord = (x:number,y:number):Coord =>{
    return {x,y,getNeigbors() {
        const nbors = [];
        for (const [dx,dy] of deltas){
            nbors.push(createCoord(dx + this.x, dy + this.y))
        }
        return nbors;
        }
}
}

const isInBounds = (maxX:number,maxY:number,coord:Coord):boolean => {
    return coord.x >= 0 && coord.y >= 0 && coord.x < maxX && coord.y < maxY;
}

interface BadPriorityQueue {
    elements: [Coord,number][];
    addElement(coord:Coord,distance:number,path: Coord[]):void;
    deQueue():[Coord,number]
}

const createPQueue = ():BadPriorityQueue=>{
    return {
        elements: [],
        addElement(coord,distance,path){
            this.elements.push([coord,distance]);
            this.elements.sort((a,b)=>b[1] - a[1]);
        },
        deQueue(){
            return this.elements.pop()!;
        }
    }
}

const parseInput2 = (input:string):Coord[] =>{
    let corruptedCells = [];
    for (const coord of input.trim().split("\n")){
        const [x,y] = coord.split(",").map(c=>parseInt(c));
        corruptedCells.push(createCoord(x,y));
    }
    corruptedCells.reverse()
    return corruptedCells;
}

const readIncomingWall = (wallSet:Set<string>, corruptedCells: Coord[]) =>{
    let currentCorruptedByte = corruptedCells.pop()!;
    wallSet.add(coordToString([currentCorruptedByte.x, currentCorruptedByte.y]));
}
const parseInput = (input:string,numberOfBytes:number):Map<string,Coord> =>{
    let corruptedCells = new Map<string,Coord>;
    for (const coord of input.trim().split("\n").slice(0,numberOfBytes)){
        const [x,y] = coord.split(",").map(c=>parseInt(c));
        corruptedCells.set(coordToString([x,y]), createCoord(x,y));
    }
    return corruptedCells;
}
const dfs = (walls: Set<string>, maxX:number,maxY:number, startCoord:Coord, visited: Set<string> = new Set):boolean=>{
    console.log({startCoord});
if(startCoord.x === maxX -1 && startCoord.y === maxY - 1){ return true} // The end has been found
const currentCoordToString = coordToString([startCoord.x, startCoord.y]);
// add current to visited
    visited.add(currentCoordToString);
//visit non-visited neighbors
const neighbors = startCoord.getNeigbors().filter(n=> isInBounds(maxX,maxY,n) &&!visited.has(coordToString([n.x,n.y])) && !walls.has(coordToString([n.x,n.y])));
    
return neighbors.some(n=> dfs(walls,maxX,maxY,n,visited))
    return false
}
const p2 = (input:string,maxX:number,maxY:number)=>{
const incomingWalls = parseInput2(input);
let walls = new Set<string>;
    let visited = new Set<string>;
    let hi = 3450;
    let lo = 2000;
    for(let i = 0; i < lo; i ++){
        readIncomingWall(walls,incomingWalls);
    }
    let lastCoord: Coord | boolean = false;
    while(dfs(walls,maxX,maxY,createCoord(0,0))){
        lastCoord = {...incomingWalls.at(-1)!}
        readIncomingWall(walls,incomingWalls);
    }
    console.log({lastCoord});
}

// const p1 = (input:string,numberOfBytes:number,maxX:number,maxY:number) =>{
// const corruptedCells = parseInput(input,numberOfBytes);
// const distanceArray = Array.from(Array(maxY),()=>Array.from(Array(maxX), ()=>[Infinity,[]]));
// distanceArray[0][0] = [0,[]];
// const visitedCells = new Set<string>;
// const queue = createPQueue();
// const initCoord = createCoord(0,0)
// queue.addElement(initCoord,0,[initCoord]);
// while(queue.elements.length > 0){
//     let [currentCoord,currentDistance] = queue.deQueue();
//             if(visitedCells.has(coordToString([currentCoord.x,currentCoord.y]))){
//                 continue;
//             }
//     currentCoord.getNeigbors().filter(c=>
//         isInBounds(maxX,maxY,c) && 
//         !corruptedCells.has(coordToString([c.x,c.y]))
//     ).forEach(nbor =>{
//         distanceArray[nbor.y][nbor.x] = Math.min(currentDistance + 1, distanceArray[nbor.y][nbor.x]);
//             if(!visitedCells.has(coordToString([nbor.x,nbor.y]))){
//                 queue.addElement(nbor,currentDistance + 1);
//             }
//     })
//     visitedCells.add(coordToString([currentCoord.x,currentCoord.y]));

// }
// return distanceArray[maxY - 1 ][maxX - 1];
// }
const main = async () => {
    const input = await readInput("./inputs/18.txt");
    const MAX_X = 71;
    const MAX_Y = 71;
    // const part1 = p1(input,1024,MAX_X,MAX_Y);
    const part2 = p2(input,MAX_X,MAX_Y);

}
main();
