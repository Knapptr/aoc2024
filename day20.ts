import {readInput} from "./readInput";
import parseGraph2D from "./helpers/parseGrid2D";
import coordToString from "./helpers/coordToString";

type Coord = [number,number]; //Y, X

interface Cell{
    coords:Coord;
    char: string
    getNeighbors():Coord[]
    isWall():boolean
}

const deltas:Coord[] = [
    [0,1],
    [0,-1],
    [1,0],
    [-1,0]
]
const initCell =(char:string,coords:Coord):Cell =>{
    return {
        coords,
        char,
        getNeighbors() {
        const nbors:Coord[] = [];
            for (const [dY,dX] of deltas){
                nbors.push([this.coords[0] + dY, this.coords[1] + dX]);
            }
            return nbors;
        },
        isWall() {
            return this.char === "#"
        },
    }
}


const isInBounds = (coords:Coord,map:Cell[][]) =>{
    const maxY = map.length;
    const maxX = map[0].length;
    return coords[0] >= 0 && coords[0] < maxY && coords[1] >= 0 && coords[1] < maxX;
};
interface CellMap {
    cells: Cell[][];
    startCoords: Coord;
    endCoords: Coord;
    atCoords(coords:Coord):Cell;
}
const parseMap = (input:string):CellMap =>{
    let startCoords:Coord = [-1,-1];
    let endCoords:Coord = [-1,-1];
    const cells =  input.trim().split("\n").map((col,ci)=>{
        return col.trim().split("").map((c,ri)=>{
            if(c === "S"){startCoords = [ci,ri]}
            if(c === "E"){endCoords = [ci,ri]}
            return initCell(c,[ci,ri]);
        })
    })
    return {cells,startCoords,endCoords, 
        atCoords(coords) {
        return this.cells[coords[0]][coords[1]]
    },}
}


const cloneCoords = (coords:Coord):Coord =>{
    return [...coords];
}

/** kept running in to stack overflow problems with the recursive DFS. Because there is only a single path, this can be solved iteratively */
const iterativeRoute = (map:CellMap): Coord[] =>{
     let currentCell = map.atCoords(map.startCoords);
    const route = [currentCell.coords];
    const visited = new Set<string>;
    while(currentCell.char !== "E"){
        visited.add(coordToString(currentCell.coords));
        const nbors = currentCell.getNeighbors().filter(n=>isInBounds(n,map.cells) && map.atCoords(n).char !== "#" && !visited.has(coordToString(n)));
        currentCell = map.atCoords(nbors[0]);
        route.push(currentCell.coords)
    }
    return route
}
/** Returns the finishing route */
const dfsRoute = (map:CellMap, visited: Set<string>, currentCell: [Cell, Coord[]]): Coord[] =>{
    const cells = map.cells
    const [cell,steps] = currentCell;
    if(cell.char === "E"){return steps}
    // do all neighbors that are valid
    const potentialNextSteps  = cell.getNeighbors().filter(c=>isInBounds(c,cells) && !visited.has(coordToString(c)) && map.atCoords(c).char !== "#");
    for(const i of potentialNextSteps){visited.add(coordToString(i))};
    for(const nextStep of potentialNextSteps){
        const cell = map.atCoords(nextStep);
        
        if(cell.char === "#"){continue;}
        // if(visited.has(coordToString(cell.coords))){continue;}
        return dfsRoute(map,visited, [cell, [...steps.map((c)=>cloneCoords(c)), cloneCoords(cell.coords)]]);
    }
    throw new Error("no solution");
    
}

const stringToCoords=(coordString:string):Coord=>{
    const [y,x] = coordString.split(",").map(c=>parseInt(c));
    return [y,x];
}

const manhattanDistance = (lhs:Coord, rhs:Coord):number =>{
    return Math.abs(lhs[0] - rhs[0]) + Math.abs(lhs[1] - rhs[1]);
}
const tryShortcuts = (map:CellMap, routeMap:Map<string,number>,count:number,threshold:number = 1):number[]=>{
    const shortcuts = [];
    const rm = [...routeMap];
    while(rm.length > 0){
        let [currentStep, stepCount] = rm.shift()!;
        const currentCoord = stringToCoords(currentStep);
        for(const [testCoordString,testStep] of rm.slice(threshold )){
            const testCoord = stringToCoords(testCoordString);
            const distance = manhattanDistance(currentCoord,testCoord);
            if(distance <= count){
                const saved = testStep - stepCount - distance;
                if(saved >= threshold){
                shortcuts.push(saved);
                }
            }
        }
    }
    return shortcuts

}


/* Abandoned. Why doesn't this work!?
// const tryShortcuts = (map:CellMap, routeMap:Map<string,number>, count: number):number[]=> {
//     const shortcuts = new Map<string,number>;
//     for(const [step,startCount] of routeMap){
//         const [startY, startX] = stringToCoords(step);
//         // check all ending locations from Count down to 1
//         for (let max = count; max > 0; max -- ){
//             for(let offset = count - max; offset >= 0; offset --){

//                 console.log({max,offset});
//                 const potentialCoords:Coord[] = [
//                     [startY + max - offset, startX + offset],
//                     [startY - max + offset, startX - offset],
//                     [startY  - offset, startX - max],
//                     [startY  + offset, startX + max],
//                 ]
//                 for(const testCoord of potentialCoords){
//                     // check if it is in the route
//                     const testId = coordToString(testCoord);
//                     if(routeMap.has(testId)){
//                         // check if it is actually a savings
//                         const endCost = routeMap.get(testId)!;
//                         const saved = endCost - startCount - max - offset 
//                         const shortcutId = `${stringToCoords(step)}-${testId}`;
//                         if(saved > 0){
//                             console.log("Shortcut from: ", [startY,startX], "TO:", testId);
//                             const updatedSavings = shortcuts.get(shortcutId) || 0;
//                             shortcuts.set(shortcutId, Math.max(saved,updatedSavings));
//                         }

//                     }

//                 }

//             }
//             }
//     }

    return [...shortcuts.values()];
}
/** Finds all potential shortcuts and their savings */
const findShortcuts = (map:CellMap, routeMap:Map<string,number>, nanoCount: number,threshold?: number):number[] =>{

        const shortcuts = tryShortcuts(map,routeMap,nanoCount,threshold);
        
    return shortcuts
}

const main = async () =>{
    const input = await readInput("./inputs/20.txt");
    const map = parseMap(input);
    // const route = dfsRoute(map,new Set, [map.atCoords(map.startCoords), [map.startCoords]])
    const route = iterativeRoute(map);
    const rm = new Map(route.map((c,ri)=>{return [coordToString(c), ri] }));
    const p2 = findShortcuts(map,rm,20,100)//.filter(s=>s >= 50);
    // const p1 = savings.filter(s=>s>=50).length;
    
    console.log(p2.length);
}

main();
//5478 too high


