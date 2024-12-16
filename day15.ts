import  readLine  from "readline";
import { readInput } from "./readInput";
import { stdin } from "process";

type Coord = [number,number];
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
interface Cell{
    type: "WALL" | "CRATE" | "ROBOT" | "EMPTY";
    coords: Coord;
}

interface MovableCell extends Cell{
    getTargetCoords(direction:Dir):Coord;
    /** Tries to move cells recursively. Returns true if move possible/successful. False if not possible*/
    move(map:WarehouseMap, direction: Dir,firstPush?:boolean):boolean
}

interface Crate extends MovableCell{
    side: "L" | "R";
    getMoveCoords(map:WarehouseMap,direction:Dir): [[Coord,Coord],[Coord,Coord]];
    isPushable(map:WarehouseMap,directioni:Dir):boolean
}



interface WarehouseMap {
    cells: Cell[][];
    botCoords: Coord;
    /** Move the guard if possible along with crates*/
    tryMoveBot(dir:Dir):void;
    atCoords(coord:Coord): Cell;
    moveCell(startCoords:Coord,endCoords:Coord):void;
}

const moveDeltas: {[key in Dir]: Coord} = {
    "UP": [-1,0],
    "DOWN": [1,0],
    "LEFT": [0,-1],
    "RIGHT": [0,1],
}

const cellFromChar = (char:string,coords:Coord): Cell => {
    switch (char){
        case "#": return createWallCell(coords);
        case ".": return createEmptyCell(coords);
        case "@": return createMoveableCell("ROBOT",coords);
        case "O": return createMoveableCell("CRATE",coords);
        default: throw new Error("Invalid Map Character");
    }
}
const createWallCell = (coords: Coord):Cell => {return {type:"WALL", coords} }
const createEmptyCell = (coords:Coord):Cell => {
    return {type: "EMPTY", coords}
}
const createCrate = (coords:Coord,side:"L" | "R"):Cell => {
    const crate: Crate = {
        type:"CRATE",
        side,
        coords,
        getMoveCoords(map:WarehouseMap,direction:Dir) {
            const otherCoords = this.side === "L" ? this.getTargetCoords("RIGHT") : this.getTargetCoords("LEFT");
            const otherCrate = map.atCoords(otherCoords) as Crate;
            return [[this.coords,this.getTargetCoords(direction)],[otherCrate.coords, otherCrate.getTargetCoords(direction)]];
        },
        getTargetCoords(direction):Coord {
            const [dY,dX] = moveDeltas[direction];
            return [this.coords[0] + dY, this.coords[1] + dX];
        },
        isPushable(map, direction) {
            const otherHalfCoords = this.side === "L"?this.getTargetCoords("RIGHT"):this.getTargetCoords("LEFT");
            const otherHalf = map.atCoords(otherHalfCoords) as Crate;
            const rightCrate = this.side === "R" && this || otherHalf;
            const leftCrate = this.side === "L" && this || otherHalf;
            const atLeftTarget = map.atCoords(leftCrate.getTargetCoords(direction)) as Crate;
            const atRightTarget = map.atCoords(rightCrate.getTargetCoords(direction)) as Crate;
            if(direction === "LEFT"){
                if (atLeftTarget.type === "WALL"){return false}
                if (atLeftTarget.type === "EMPTY"){return true}
                return atLeftTarget.isPushable(map,direction);
            }
            if(direction === "RIGHT"){
                if (atRightTarget.type === "WALL"){return false}
                if (atRightTarget.type === "EMPTY"){return true}
                return atRightTarget.isPushable(map,direction);
            }
            if(direction === "UP"){
                if (atRightTarget.type === "WALL" || atLeftTarget.type === "WALL"){return false}
                if (atLeftTarget.type === "EMPTY" && atRightTarget.type === "EMPTY"){return true}
                const leftPushable = atLeftTarget.type === "EMPTY" || atLeftTarget.isPushable(map,direction);
                const rightPushable = atRightTarget.type === "EMPTY" || atRightTarget.isPushable(map,direction);
                return leftPushable && rightPushable;
            }
            if(direction === "DOWN"){
                if (atRightTarget.type === "WALL" || atLeftTarget.type === "WALL"){return false}
                if (atLeftTarget.type === "EMPTY" && atRightTarget.type === "EMPTY"){return true}
                const leftPushable = atLeftTarget.type === "EMPTY" || atLeftTarget.isPushable(map,direction);
                const rightPushable = atRightTarget.type === "EMPTY" || atRightTarget.isPushable(map,direction);
                return leftPushable && rightPushable;
            }
            // unreachable
            return false

        },
        move(map:WarehouseMap, direction:Dir, firstPush:boolean):boolean {
       //handle the moving of the crate 
                const crate = this ;
           // Left Right movement is the same as before! 
            if(direction === 'LEFT' || direction === "RIGHT"){
                   const crateTarget = crate.getTargetCoords(direction);
                const atTargetCoords = map.atCoords(crateTarget) as MovableCell;
                if(atTargetCoords.type === "EMPTY"){
                    map.moveCell(crate.coords,crateTarget)
                    crate.coords = crateTarget;
                    return true
                }
                if(atTargetCoords.type === "WALL"){
                    return false
                }
                if(atTargetCoords.type === "CRATE"){
                    if(atTargetCoords.move(map,direction)){
                    map.moveCell(crate.coords,crateTarget)
                    crate.coords = crateTarget;
                    return true
                    }
                }
                return false // unreachable
            }else{

            // Up and down movement 

            if(this.isPushable(map,direction)){
                // pushit
                for (const [src,target] of this.getMoveCoords(map,direction)){
                    // move all pushables
                    let stack:Crate[] = [];
                    let currentTarget = map.atCoords(target) as Crate;
                    while(currentTarget.type !== "EMPTY" && currentTarget.type !== "WALL"){
                        stack.push(currentTarget);
                        currentTarget = map.atCoords(currentTarget.getTargetCoords(direction)) as Crate;
                    }
                    while (stack.length > 0){
                        let current = stack.pop()!;
                        current.move(map,direction);
                    }
                    map.moveCell(src,target);
                }
                return true
            }
            

            return false
     }
        }
}
        return crate;
}
const createCrates = (lCoords:Coord):[Cell,Cell] =>{
    const leftCrate = createCrate(lCoords,"L")
    const rightCrate = createCrate([lCoords[0],lCoords[1] + 1],"R");
    return [leftCrate,rightCrate]
}
const createMoveableCell = (type: "CRATE" | "ROBOT", coords: Coord):MovableCell => {
    return {
        type,
        coords,
        getTargetCoords(direction:Dir){
            const [dY,dX] = moveDeltas[direction];
            return [this.coords[0] + dY, this.coords[1] + dX];
        },
        move(map, direction):boolean {
           let targetCoords = this.getTargetCoords(direction) ;
            let atTarget = map.atCoords(targetCoords) as MovableCell // The cell may actually not be moveable, but the type narrowing is done below.
            if(atTarget.type === "WALL"){ return false} // Base Case- move is not possible. Done!
            if(atTarget.type === "ROBOT"){throw new Error("Another robot has been found in the warehouse! Panic!")}
            if(atTarget.type === "EMPTY"){ 
                // move!
                map.moveCell(this.coords,targetCoords);
                this.coords = targetCoords;
                return true;}
            if(atTarget.move(map,direction)){
                // the next move is possible, so move!
                map.moveCell(this.coords,targetCoords);
                this.coords = targetCoords;
                return true;
            }
            // this should be unreachable
            return false
        },
    }
}

class WarehouseMap implements WarehouseMap{

    constructor(cells:Cell[][],botCoords:Coord){
        this.cells = cells;
        this.botCoords = botCoords;
    }
    atCoords(coord:Coord):Cell {
           return this.cells[coord[0]][coord[1]];
       }

    tryMoveBot(dir:Dir){
        // console.log("Moving bot: ", dir);
        const bot = this.atCoords(this.botCoords) as MovableCell;
        bot.move(this,dir);
        //update the bot coords. They may not have changed
        this.botCoords = bot.coords;
    }
   moveCell(startCoords:Coord, endCoords:Coord) {
            const [startY,startX] = startCoords;
           const [endY, endX] = endCoords;
       // console.log("Moving from ", startCoords, "to: ",endCoords);
           const movedObject = this.cells[startY][startX];
           this.cells[startY][startX] = createEmptyCell([startY,startX]);
           movedObject.coords = [endY, endX];
           this.cells[endY][endX] = movedObject;
       }
   } ;

type BotMoves = Dir[]
const parseBotMoves = (input:string):BotMoves =>{
    const botMoves: BotMoves = [];

    for (const char of input.trim()){
        switch (char) {
            case "<": botMoves.push("LEFT"); break;
            case ">": botMoves.push("RIGHT"); break;
            case "v": botMoves.push("DOWN");break;
            case "^": botMoves.push("UP");break;
        }
    }
    return botMoves;
}
const parseInputP1 = (input:string):[WarehouseMap,BotMoves] => {
    const [mapString,moveString] = input.trim().split("\n\n");

    let botCoords:Coord = [-1,-1] // init with non-possible value
    const cells: Cell[][] = [];

    const mapLines = mapString.trim().split("\n");
    for (let rI = 0; rI < mapLines.length; rI ++){
        const row = [];
        const rowStr = mapLines[rI];
        for (let charI = 0; charI < rowStr.length; charI ++ ){
            const cellStr = rowStr[charI];
            // console.log({rI,charI,cellStr});
            const cell = cellFromChar(cellStr,[rI,charI]);
            if(cell.type === "ROBOT"){
                botCoords = [rI,charI];
            }
            row.push(cell);
        }
        cells.push(row);
    }
    const botMoves = parseBotMoves(moveString);
    return [new WarehouseMap(cells,botCoords), botMoves];
}

const parseInputP2 = (input:string):[WarehouseMap,BotMoves]=>{
    const [mapString,moveString] = input.trim().split("\n\n");

    let botCoords:Coord = [-1,-1] // init with non-possible value
    const cells: Cell[][] = [];

    const mapLines = mapString.trim().split("\n");
    for (let rI = 0; rI < mapLines.length; rI ++){
        const row = [];
        const rowStr = mapLines[rI];
        for (let charI = 0; charI < rowStr.length; charI ++ ){
            const leftIndex = charI * 2;
            const rightIndex = leftIndex + 1;

            const cellStr = rowStr[charI];
            // console.log({rI,charI,cellStr});
            const cell = cellFromChar(cellStr,[rI,leftIndex]);
            // Handle the additional cells
            if(cell.type === "ROBOT"){
                botCoords = [rI,leftIndex];
            row.push(cell);
                row.push(createEmptyCell([rI,rightIndex]));
                
            }
            if(cell.type === "WALL"){
                row.push(cell);
                    row.push(createWallCell([rI,rightIndex]));
                
            }
            if(cell.type === "CRATE"){
                const [crateL,crateR] = createCrates([rI,leftIndex])
                row.push(crateL,crateR);
            }
            if(cell.type === "EMPTY"){
                row.push(cell);
                row.push(createEmptyCell([rI,rightIndex]));
            }
        }
        cells.push(row);
    }
    const botMoves = parseBotMoves(moveString);
    return [new WarehouseMap(cells,botCoords), botMoves];

}

const getGpsCoords = (coords:Coord):number => {
    return (coords[0] * 100) + coords[1]
}
const main = async () => {
 const input = await readInput("./inputs/15.txt");
    // const [warehouse,moves] = parseInputP1(input);
    // for( const move of moves) {
    //     warehouse.tryMoveBot(move);
    // }
    // // console.log({warehouse});
    // // renderWarehouse(warehouse);
    // let p1 = 0;
    // for(const row of warehouse.cells){
    //     for(const cell of row){
    //         if(cell.type === "CRATE"){
    //             p1+= getGpsCoords(cell.coords);
    //         }
    //     }
    // }
    // console.log({p1});

    /// Part 2
    const [warehouse2,moves2] = parseInputP2(input);
    // renderWarehouse(warehouse2);
    for(const move of moves2){
        warehouse2.tryMoveBot(move);
        // renderWarehouse(warehouse2);
    }
    let p2 = 0;
    for(const row of warehouse2.cells){
        for(const cell of row){
            if(cell.type === "CRATE" ){
                const crate = cell as Crate;
                if(crate.side==="L"){
                    p2 += getGpsCoords(crate.coords)
                }
            }
        }
    }
    // renderWarehouse(warehouse2);
    console.log({p2});
    // gameLoop(warehouse2);

}

main();

// Extras
const renderWarehouse = (warehouse:WarehouseMap):void => {
    let render:string = "";
    for (const row of warehouse.cells){
        for(const cell of row){
            let char: string;
            switch (cell.type){
                case "WALL": char = "#"; break;
                case "ROBOT": char = "@"; break;
                case "CRATE": {
                    const crate = cell as Crate;
                    if(crate.side === undefined){ char = "O"; break;}
                    if(crate.side === "L"){char = "["; break;}
                    char = "]";
                    break;
                }
                case "EMPTY": char = "."; break;
            }
            render += char;
        }
        render += "\n";
    }
    console.log(render);
}

const gameLoop = async (warehouse:WarehouseMap):Promise<void> =>{
    readLine.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY)
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (chunk,key)=>{
        let currentCommand:Dir = "UP"
        if(key.name === "left"){currentCommand = "LEFT"}
        if(key.name === "right"){currentCommand = "RIGHT"}
        if(key.name === "up"){currentCommand = "UP"}
        if(key.name === "down"){currentCommand = "DOWN"}
        if(key.name === "q"){process.exit()}
        warehouse.tryMoveBot(currentCommand);
        console.clear();
        renderWarehouse(warehouse)
    })
    renderWarehouse(warehouse);
    //////
}
