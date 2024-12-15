import { readInput } from "./readInput";

type Coord = [number,number];
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
interface Cell{
    type: "WALL" | "CRATE" | "ROBOT" | "EMPTY";
    coords: Coord;
}

interface MovableCell extends Cell{
    getTargetCoords(direction:Dir):Coord;
    /** Tries to move cells recursively. Returns true if move possible/successful. False if not possible*/
    move(map:WarehouseMap, direction: Dir):boolean
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
        const bot = this.atCoords(this.botCoords) as MovableCell;
        bot.move(this,dir);
        //update the bot coords. They may not have changed
        this.botCoords = bot.coords;
    }
   moveCell(startCoords:Coord, endCoords:Coord) {
            const [startY,startX] = startCoords;
           const [endY, endX] = endCoords;
           const movedObject = this.cells[startY][startX];
           this.cells[startY][startX] = createEmptyCell([startY,startX]);
           movedObject.coords = [endY, endX];
           this.cells[endY][endX] = movedObject;
       }
   } ;

type BotMoves = Dir[]
const parseInput = (input:string):[WarehouseMap,BotMoves] => {
    const [mapString,moveString] = input.trim().split("\n\n");
    const botMoves: BotMoves = [];

    for (const char of moveString.trim()){
        switch (char) {
            case "<": botMoves.push("LEFT"); break;
            case ">": botMoves.push("RIGHT"); break;
            case "v": botMoves.push("DOWN");break;
            case "^": botMoves.push("UP");break;
        }
    }

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
    return [new WarehouseMap(cells,botCoords), botMoves];
}

const getGpsCoords = (coords:Coord):number => {
    return (coords[0] * 100) + coords[1]
}
const main = async () => {
 const input = await readInput("./inputs/15.txt");
    const [warehouse,moves] = parseInput(input);
    for( const move of moves) {
        warehouse.tryMoveBot(move);
    }
    // console.log({warehouse});
    // renderWarehouse(warehouse);
    let p1 = 0;
    for(const row of warehouse.cells){
        for(const cell of row){
            if(cell.type === "CRATE"){
                p1+= getGpsCoords(cell.coords);
            }
        }
    }
    console.log({p1});
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
                case "CRATE": char = "O"; break;
                case "EMPTY": char = "."; break;
            }
            render += char;
        }
        render += "\n";
    }
    console.log(render);
}
