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

/** Finds all potential shortcuts and their savings */
const findShortcuts = (map:CellMap, routeMap:Map<string,number>):number[] =>{
    const shortcutSavings = [];
    for (const [coords,stepNumber] of routeMap){
        const asCoord = stringToCoords(coords);
        const asCell = map.atCoords(asCoord);
        const neighborWalls = asCell.getNeighbors().filter(n=>isInBounds(n,map.cells) && map.atCoords(n).char === "#");
        // check 1 away from each neighbor
    const visited = new Set<string>;
for (const firstNbor of neighborWalls){
    visited.add(coordToString(firstNbor));
    const firstCell = map.atCoords(firstNbor);
    const nbors2 = firstCell.getNeighbors().filter(n=>isInBounds(n,map.cells) && !visited.has(coordToString(n)));
    // check if any of these neighbors are viable shortcuts already
    for(const secNbor of nbors2){
    visited.add(coordToString(secNbor));
            const secondCell = map.atCoords(secNbor);
        if(routeMap.has(coordToString(secNbor))){
            const stepsTwo = routeMap.get(coordToString(secNbor))!;
            const savings = (stepsTwo - stepNumber) - 2;
            if(savings > 0){
                // console.log({secNbor,firstNbor, savings});
                shortcutSavings.push(savings);
            }
        // }else{ // Check third neighbors here
        //     const nbors3 = secondCell.getNeighbors().filter(n=> isInBounds(n,map.cells) && !visited.has(coordToString(n)));
        //     for(const thirdNbor of nbors3){
        // if(routeMap.has(coordToString(thirdNbor))){
        //     const stepsThree = routeMap.get(coordToString(thirdNbor))!;
        //     const savings = (stepsThree - stepNumber) - 3;
        //     if(savings > 0){
        //         // console.log({secNbor,firstNbor, savings});
        //         shortcutSavings.push(savings);
        //     }
        //     }

        // }
    }
}
        // check 1 away from that to see if:
        // 1) it is another wall
        // 2) it is a cell along the route
    }
}
    return shortcutSavings;
}

const main = async () =>{
    const input = await readInput("./inputs/20.txt");
    const map = parseMap(input);
    // const route = dfsRoute(map,new Set, [map.atCoords(map.startCoords), [map.startCoords]])
    const route = iterativeRoute(map);
    const rm = new Map(route.map((c,ri)=>{return [coordToString(c), ri] }));
    const savings = findShortcuts(map,rm);
    const p1 = savings.filter(s=>s>=100).length;
    
    console.log({p1});
}

main();
//5478 too high


