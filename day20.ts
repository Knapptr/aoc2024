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


const tryShortcuts = (map:CellMap,route:Map<string,number>, currentCell:Cell, visited:Set<string>,collected: Map<string,Set<number>>, remaining:number, max:number,startCost:number, startCoords:Coord):Map<string,Set<number>> => {
    if(remaining < 0){return collected}
    const currentCost = max - remaining;
    // console.log({currentCost,max,remaining});
    const coords = coordToString(currentCell.coords)
    // mark current cell as visited
    // handle being back on an empty space
    // if(route.has(coords) && route.get(coords)! - startCost - currentCost > 0){
    //     if(coords === "7,3" && coordToString(startCoords) === "3,1"){ 
    //         console.log('at the shortcut');
    //         console.log({coords,startCoords, currentCost})
    //     }
    //     const endCost = route.get(coords)!
    //     const savings =  endCost - startCost - currentCost;
    //     const shortcutId = `${coordToString(startCoords)}-${coords}`;
    //     const oldSavings = collected.get(shortcutId) || new Set;
    //     oldSavings.add(savings);
    //     collected.set(shortcutId, oldSavings);
    //     return collected
    // }
    // if(remaining === 0){return collected}
    // proces non-visited cells
    visited.add(coords);
    const nbors = currentCell.getNeighbors().filter(n=>isInBounds(n,map.cells));
    for(const nbor of nbors){
        console.log({at: coords, nbor});
        const nborId = coordToString(nbor);
        // check if neighbor is an ending
    if(route.has(nborId)){
        // console.log("Found shortcut");
        if(nborId === "7,3" && coordToString(startCoords) === "3,1"){ 
            console.log('at the shortcut');
            console.log({coords,nborId,startCoords, currentCost})
        }
        const endCost = route.get(nborId)!
        const savings =  endCost - startCost - currentCost - 1;
        // console.log({savings});
        const shortcutId = `${coordToString(startCoords)}-${nborId}`;
        const oldSavings = collected.get(shortcutId) || new Set;
        if(savings > 0){
            oldSavings.add(savings);
            collected.set(shortcutId, oldSavings);
        }
    }else{
        // recurse on non-visited neighors
        if(!visited.has(nborId)){
            tryShortcuts(map,route,map.atCoords(nbor), visited ,collected,remaining - 1, max, startCost,startCoords);
        }
    }

    }
    return collected;
    
}
/** Finds all potential shortcuts and their savings */
const findShortcuts = (map:CellMap, routeMap:Map<string,number>, nanoCount: number):number[] =>{

        const shortcuts:Map<string,Set<number>> = new Map;
    for (const [coords,stepNumber] of routeMap){
        const asCoord = stringToCoords(coords);
        const asCell = map.atCoords(asCoord);
        tryShortcuts(map,routeMap,asCell, new Set, shortcuts, nanoCount, nanoCount, stepNumber,asCoord);
    }
        
    console.log({shortcuts});
    return [...shortcuts.values()].reduce((acc:number[],cv)=>{
        acc = [...acc, ...cv.values()]
        return acc;
    },[])
}

const main = async () =>{
    const input = await readInput("./inputs/20.test.txt");
    const map = parseMap(input);
    // const route = dfsRoute(map,new Set, [map.atCoords(map.startCoords), [map.startCoords]])
    const route = iterativeRoute(map);
    const rm = new Map(route.map((c,ri)=>{return [coordToString(c), ri] }));
    console.log({rm});
    const savings = findShortcuts(map,rm,19)//.filter(s=>s >= 50);
    // const p1 = savings.filter(s=>s>=50).length;
    const p1 = savings.reduce((acc: {[key:number]: number},cv)=> {
        acc[cv] = acc[cv] + 1 || 1;
        return acc;
    }, {})
    
    console.log({p1});
}

main();
//5478 too high


