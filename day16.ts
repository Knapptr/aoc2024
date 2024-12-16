import {readInput} from './readInput';
import parseGrid2D from "./helpers/parseGrid2D";
import coordToString from './helpers/coordToString';

type Dir = "UP"|"DOWN"|"LEFT"|"RIGHT";

type Coord = [number,number];

interface Reindeer{
    direction: Dir
    coords: Coord
    score: number;
    visitedCoords: Set<string>
}

const cloneDeer = (deer:Reindeer):Reindeer => {
    return {
        direction: deer.direction,
        coords: [...deer.coords],
        score: deer.score,
        visitedCoords: new Set([...deer.visitedCoords])
    }
}

const scores = {
    "TURN": 1000,
    "MOVE": 1
}

/** Current direction and [left,right] */
const turnDirections: {[k in Dir]: [Dir,Dir,Dir]} = {
      "UP": ["LEFT","RIGHT","DOWN"],
    "LEFT": ["DOWN","UP", "RIGHT"],
    "DOWN": ["RIGHT","LEFT", "UP"],
    "RIGHT": ["UP","DOWN", "LEFT"]

}
const TURNSCORE = 1000;
const MOVESCORE = 1;
const turnDeer = (deer:Reindeer,direction:Dir):Reindeer=> {
   const [turnDirIndex,score] = direction === "LEFT" ? [0,TURNSCORE] : direction === "DOWN"? [2,TURNSCORE * 2]: [1, TURNSCORE] ;
    deer.direction = turnDirections[deer.direction][turnDirIndex];
    deer.score += score;
    return cloneDeer(deer)

}
const advanceDeer = (deer:Reindeer): Reindeer =>{
    const [dY,dX] = moveDeltas[deer.direction];
    deer.visitedCoords.add(coordToString(deer.coords))
    deer.coords = [deer.coords[0] + dY, deer.coords[1] + dX ];
    deer.score += MOVESCORE;
    return cloneDeer(deer)
}
/** clones deer and moves, adjusting score as nesc */
const possibleDeerMoves = (deer:Reindeer):[Reindeer,Reindeer,Reindeer,Reindeer] => {
    // Deer can continue forward
    // Deer can turn 90 left, then move forward
    // Deer can turn 90 right, then move forward
    // Deer could turn 180 (2 90 deg turns) then move forward
    
    const backDeer = turnDeer(cloneDeer(deer),"DOWN");
    const leftDeer = turnDeer(cloneDeer(deer),"LEFT");
    const rightDeer = turnDeer(cloneDeer(deer),"RIGHT");
    return [advanceDeer(deer), advanceDeer(leftDeer), advanceDeer(rightDeer), advanceDeer(backDeer)];
}

const moveDeltas:{[k in Dir]: Coord} = {
    "UP": [-1,0],
    "DOWN": [1,0],
    "LEFT": [0,-1],
    "RIGHT": [0,1],
}

const initDeer = ():Reindeer => {return {direction: "RIGHT", coords: [-1,-1], score: 0, visitedCoords: new Set}}
const globalDeer = initDeer();

type Maze = string[][];
const parseMaze  = (input:string) =>  parseGrid2D(input, (char,ri,ci)=>{
    if (char === "S"){globalDeer.coords = [ri,ci]}
    return char})


let globalLowest = Infinity
const globalSeen: Map<string,number> = new Map;
const solveOne = (maze:Maze,deer:Reindeer):number | null =>{
    if(deer.score > globalLowest){return null}
    const mazeCell = maze[deer.coords[0]][deer.coords[1]];
    // base case deer is at end 
    if (mazeCell === "E"){ 
        console.log("AT END!");
        return deer.score;}
    // Deer is at wall. Cant continue
    if (mazeCell === "#"){return null}
    // Deer is at seen space, abort
    const oldScore = globalSeen.get(coordToString(deer.coords)) || Infinity;
    if(globalSeen.has(coordToString(deer.coords)) && oldScore < deer.score){
        return null 
    }
    globalSeen.set(coordToString(deer.coords), deer.score);
    // Deer must be an an empty space. 
    // check for all 4 posssible deer
    const moves = possibleDeerMoves(deer);
    for (const dirDeer of moves ){
        const res = solveOne(maze,dirDeer);
        if(res!== null){globalLowest = Math.min(res,globalLowest)}
        }
        
    return null
    }



const main = async () =>{
    const input = await readInput("./inputs/16.txt");
    const maze = parseMaze(input);
    console.log({globalDeer});
    const res = solveOne(maze,globalDeer);
    console.log({res, globalLowest});

}

main();
