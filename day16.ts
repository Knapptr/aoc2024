import {readInput} from './readInput';
import parseGrid2D from "./helpers/parseGrid2D";
import coordToString from './helpers/coordToString';

type Dir = "UP"|"DOWN"|"LEFT"|"RIGHT";

type Coord = [number,number];

interface Reindeer{
    direction: Dir
    coords: Coord
    score: number;
    path: string[];
}

const cloneDeer = (deer:Reindeer):Reindeer => {
    return {
        direction: deer.direction,
        coords: [...deer.coords],
        score: deer.score,
        path: [...deer.path],
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
const moveDeltas:{[k in Dir]: Coord} = {
    "UP": [-1,0],
    "DOWN": [1,0],
    "LEFT": [0,-1],
    "RIGHT": [0,1],
}

const initDeer = (coords:Coord):Reindeer => {return {direction: "RIGHT", coords, score: 0,path:[]}}

const advanceDeer = (deer:Reindeer):Reindeer => {
    const newDeer = cloneDeer(deer);
    const [dY,dX] = moveDeltas[deer.direction];
    newDeer.path.push(coordToString(deer.coords));
    newDeer.coords = [deer.coords[0] + dY, deer.coords[1] +dX];
    newDeer.score += MOVESCORE;
    return newDeer;
}

const turnDeer = (deer:Reindeer, direction:Dir):Reindeer =>{
    const newDeer = {...deer};
    const turnIndex = direction === "LEFT"?0:direction=== "RIGHT"?1:2;
    newDeer.direction = turnDirections[newDeer.direction][turnIndex];
    newDeer.score += TURNSCORE;
    return newDeer;
}


type Maze = string[][];
const parseMaze  = (input:string):[Maze,Coord,Coord] =>  {
    let deerCoords:Coord = [-1,-1];
    let endCoords:Coord = [-1,-1];
    const cells = parseGrid2D(input, (char,ri,ci)=>{
    if (char === "S"){deerCoords = [ri,ci];}
    if(char ==="E"){ endCoords = [ri,ci];}
    return char})
    return [cells,deerCoords,endCoords]
}

const getAtCoords = (maze:Maze,coords:Coord):string =>{
    return maze[coords[0]][coords[1]];
}
const setCoordMin = (map: number[][],coord:Coord,value:number)=> {
    const currentValue = map[coord[0]][coord[1]];
    map[coord[0]][coord[1]] = Math.min(currentValue,value);
}

type DQueue = Reindeer[]; 
/** A poorly (slow) implemented priority queue */
const priorityEnqueue = (cheapestQueue:DQueue, deer:Reindeer) =>{
    cheapestQueue.push(deer);
    cheapestQueue.sort((a,b)=> b.score - a.score);
}

const vectorId = (deer:Reindeer):string=>{
return `${coordToString(deer.coords)}-${deer.direction}`;
}
const dijkstra = (maze:string[][],deer:Reindeer,distanceTracker: number[][],seenTracker: Set<string>):Reindeer[] =>{
    const queue:DQueue= [deer]; // Priority queue, done lazily here
    let successfulPaths:Reindeer[] = [];
    let lowestScore = Infinity;

    while(queue.length > 0){
        const currentDeer = queue.pop()!;
        // Handle end of path information
        // console.log(currentDeer);
    // Update values of all neighbors
        const forwardDeer = advanceDeer(currentDeer);
        const leftDeer = advanceDeer(turnDeer(currentDeer,"LEFT")) ;
        const rightDeer = advanceDeer(turnDeer(currentDeer,"RIGHT")) ;
        const backDeer = advanceDeer(turnDeer(currentDeer,"DOWN")) ;

    const allNbors = [forwardDeer,leftDeer,rightDeer,backDeer];
    for (const nbor of allNbors){
        // console.log({nbor});
        const atCell = getAtCoords(maze,nbor.coords);
        if(atCell!=="#"){
            setCoordMin(distanceTracker,nbor.coords,nbor.score);
            if(atCell === "E"){
                if(nbor.score === lowestScore){
                    const successfulDeer = cloneDeer(nbor);
                    successfulDeer.path.push(coordToString(nbor.coords))
                    successfulPaths.push(successfulDeer);
                }
                if(nbor.score < lowestScore){
                    lowestScore = nbor.score;
                    successfulPaths = [nbor]
                }            }
        }
        // add unseen coords to pQueue
        if(!seenTracker.has(vectorId(nbor)) && getAtCoords(maze,nbor.coords) !== "#"){
            priorityEnqueue(queue,nbor);
        }
    }
        seenTracker.add(vectorId(currentDeer));
    }
    return successfulPaths
}



const one = (input:string):number => {
    const [maze,deerCoords,endCoords] = parseMaze(input);
    const deer = initDeer(deerCoords);
    // Setup seen array
    const seen = new Set<string>;
    // Setup Length Measurements
    const initRow = Array.from({length:maze[0].length}, ()=>Infinity);
    const distanceArray:number[][] = Array.from({length: maze.length}, ()=>[...initRow]);
    // set start distance to 0
    distanceArray[deerCoords[0]][deerCoords[1]] = 0;
    // Visit shortest
    dijkstra(maze,deer,distanceArray,seen);
    return distanceArray[endCoords[0]][endCoords[1]];
}
const two = (input:string):number => {
    const [maze,deerCoords,endCoords] = parseMaze(input);
    const deer = initDeer(deerCoords);
    // Setup seen array
    const seen = new Set<string>;
    // Setup Length Measurements
    const initRow = Array.from({length:maze[0].length}, ()=>Infinity);
    const distanceArray:number[][] = Array.from({length: maze.length}, ()=>[...initRow]);
    // set start distance to 0
    distanceArray[deerCoords[0]][deerCoords[1]] = 0;
    // Visit shortest
    let successfulDeer = dijkstra(maze,deer,distanceArray,seen);
    const uniqSeats = new Set(successfulDeer.map(d=>d.path).flat());


    return uniqSeats.size
}
    


const main = async () =>{
    const input = await readInput("./inputs/16.txt");
    let p1 = one(input);
    console.log({p1});
    let p2 = two(input);
    console.log({p2});

}

main();
