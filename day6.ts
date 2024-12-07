import {readInput} from "./readInput";


interface Map{
    cells: Cell[][]
    guardCoords: Coords;
    guardDirection: GuardDir;
}
type Coords = [number,number];
type CellType = "EMPTY" | "FILLED" | "GUARD";


interface Cell{ type: CellType };

type MapDirection = "UP" | "DOWN" | "RIGHT" | "LEFT" | null;
type GuardDir = "UP" | "DOWN" | "RIGHT" | "LEFT";

const cellFromChar = (char:string):[Cell,MapDirection] =>{
    switch (char){
        case ".": return [{type:"EMPTY"},null ]
        case "#": return [{type:"FILLED"},null ]
        case "^": return [{type:"GUARD"},"UP" ]
        case ">": return [{type:"GUARD"},"RIGHT" ]
        case "v": return [{type:"GUARD"},"DOWN" ]
        case "<": return [{type:"GUARD"},"LEFT" ]
        default: throw new Error("Invalid Map Cell!");
    }
}


/** Returns the [map, coords of guard] 
**/
const parseMap = (input:string):Map=>{
    let guardCoords:Coords = [-1,-1];
    let guardDirection:GuardDir = "UP";
    const cells = input.trim().split("\n").map((row,rowI)=>{
        return row.split("").map((char,cellI)=>{
            const coords:Coords = [rowI,cellI];
            const [mapCell,guardDir] = cellFromChar(char);
            if (mapCell.type === "GUARD") {
                guardCoords = coords;
                guardDirection = guardDir!;
            };
            return mapCell;
        })
    });
    return {cells,guardCoords,guardDirection};
    }

const guardDeltas= {
    "UP": [-1,0],
    "DOWN": [1, 0],
    "LEFT": [0,-1],
    "RIGHT": [0,1],
};
/** Returns coords of destination if possible, null if not **/
const moveGuard = (map:Map): Coords | null => {
    const [colLen,rowLen] = [map.cells.length,map.cells[0].length];
    const [yDel,xDel] = guardDeltas[map.guardDirection];
    const [yG,xG] = map.guardCoords;
    const [yT,xT]= [yG + yDel, xG + xDel];
    // Cell is off the map
if(yT < 0 || yT >= colLen ||  xT < 0 || xT >= rowLen){
    return [yT,xT];
}
    // check if cell is empty or the orignal guard loc
    if (map.cells[yT][xT].type !== "FILLED"){
        return [yT,xT]
    }
    return null
}


const atMap = (map:Map,coords:Coords): CellType => {
    return map.cells[coords[0]][coords[1]].type
}
const setCell = (map:Map,coords:Coords,type:CellType)=>{
    map.cells[coords[0]][coords[1]] = {type};
}

interface GuardState{coords: Coords, dir:GuardDir, steps: Set<string>,positions: Set<string>};
const directionOrder:{[key:string]:GuardDir} = {"UP":"RIGHT","RIGHT":"DOWN","DOWN":"LEFT","LEFT":"UP"};

const getCoordString = (coords:Coords):string =>{
    return `${coords[0]},${coords[1]}`
}
const stringifyVector=(coords:Coords,direction:GuardDir):string=>{
    return `${coords[0]},${coords[1]}--${direction}`
}
const coordsOnMap = (map:Map,coords:Coords):boolean=>{
    const [colLen,rowLen] = [map.cells.length,map.cells[0].length]; // Bounds of the map
return map.guardCoords[0] >= 0 && map.guardCoords[0] < colLen && map.guardCoords[1] >= 0 && map.guardCoords[1] < rowLen
}
const trackGuardPositions = (map:Map):[Set<string>,GuardState[]] => {
    const steps: Set<string> = new Set<string>; // step history can be a set, as we know there are no loops in the initial walk
    const positions:Set<string> = new Set<string>; // The coords visited by the guard - without direction information
    const guardStateHistory:GuardState[] = []; // A step by step array of all the positions of the guard, and the steps to get there
    // Loop guard movement until it is off the map
    while (coordsOnMap(map,map.guardCoords)){
        positions.add(getCoordString(map.guardCoords));
        guardStateHistory.push({coords: [...map.guardCoords],dir:map.guardDirection, steps: new Set([...steps]),positions: new Set([...positions]) });
        steps.add(stringifyVector(map.guardCoords,map.guardDirection));
        let targetCoords = moveGuard(map);
        while (targetCoords === null){
           map.guardDirection = directionOrder[map.guardDirection] ;
            targetCoords = moveGuard(map);
        }
        map.guardCoords = targetCoords;
    }
    return [positions,guardStateHistory]

}

const countInsertionLoops = (map:Map):number =>{
    // do initial tracking of guard
    const [guardPositions,guardStateHistory] = trackGuardPositions(map);
    
    let loopCount = 0;
    
    while (guardStateHistory.length > 1){
    // Place obstacle at last location in guard history
    const obstacleCoords = guardStateHistory.pop()!.coords;
    // Place guard at second to lasst location in guard history
    const initGuardState = guardStateHistory.at(-1)!;
    // Make sure that the placement of the obstacle is not on a coord previously traveled on
        // console.log({obstacleCoords,initGuardState});
    if (initGuardState.positions.has(getCoordString(obstacleCoords))){continue;}
    // Set map to state
    setCell(map,obstacleCoords,"FILLED");
    map.guardCoords = initGuardState.coords;
    map.guardDirection = initGuardState.dir;
    // move guard
    while (coordsOnMap(map,map.guardCoords)){
        const guardVectorId = stringifyVector(map.guardCoords,map.guardDirection);
        // check that current location is a loop. Break inner loop if so
        if(initGuardState.steps.has(guardVectorId)){loopCount += 1;break;}
        // Add current guard location to guardSteps
        initGuardState.steps.add(stringifyVector(map.guardCoords,map.guardDirection));
    // Move guard
        let targetCoords = moveGuard(map);
        // Turn if obstacle
        while (targetCoords === null){
            map.guardDirection = directionOrder[map.guardDirection];
            targetCoords = moveGuard(map);
        };
        map.guardCoords = targetCoords;
    }
    //reset map cell
    setCell(map,obstacleCoords,"EMPTY");
    }
    return loopCount;
}

const main = async () => {
    const input = await readInput("./inputs/6.txt");
    const parsedMap = parseMap(input);
    const [guardPositions,guardHist] = trackGuardPositions(parsedMap);
    console.log({"Part 1:": guardPositions.size});
    const loopPos = countInsertionLoops(parseMap(input));
    console.log({"Part 2:": loopPos});
}

main();
