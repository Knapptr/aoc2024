import coordToString from './helpers/coordToString';
import {readInput} from './readInput';

type Coord = [number,number];

interface Robot{
    position: Coord;
    velocity: Coord;
    maxX: number;
    maxY: number;
    move():void;
}

const addCoordsWrap = (lhs:Coord, rhs:Coord, maxX: number, maxY: number):Coord =>{
    const x = ((maxX + rhs[0]) + lhs[0]) % maxX;
    const y = ((maxY + rhs[1]) + lhs[1]) % maxY;
    return [x,y]
}

const initRobot = (position:Coord,velocity:Coord, maxX:number, maxY:number):Robot =>{
    return {
        position,
        velocity,
        maxX,
        maxY,
        move(){
            this.position = addCoordsWrap(this.position,this.velocity, this.maxX, this.maxY) ;

            
        }
    }
}

type QuadrantCounts = [number,number,number,number];
const countQuadrants = (robots: Robot[], maxX:number, maxY:number): QuadrantCounts =>{
   const midX = Math.floor(maxX / 2); // This is going to work on the odd numebr contsraints of this problem
   const midY = Math.floor(maxY / 2); // This is going to work on the odd numebr contsraints of this problem

    const quadrantCounts: QuadrantCounts = [0,0,0,0];

    for (const robot of robots){
        if(robot.position[0] < midX){
            if (robot.position[1] < midY){ quadrantCounts[0] += 1; }
            if (robot.position[1] > midY){ quadrantCounts[1] += 1; }
        }
        if(robot.position[0] > midX){
            if (robot.position[1] < midY){quadrantCounts[2] += 1}
            if (robot.position[1] > midY){(quadrantCounts[3] += 1)}
        }
        
    }
    return quadrantCounts;
}

const moveBots = (robots:Robot[], moveCount: number,callback: (robots:Robot[],seconds: number)=>void = ()=>{}):void => {
    for (let i = 0; i < moveCount ; i ++){
        robots.forEach(r=>{r.move()});
        callback(robots,i);
    }
}

const createBotsFromInput = (input:string,maxX:number,maxY:number): Robot[] => {
    const robots = []
    const robotStrings = input.trim().split("\n");
    for (const botString of robotStrings ){
        const [pos,vel] = botString.trim().split(" ");
        const position:Coord = pos.trim().slice(2).split(",").map(s=>parseInt(s)) as Coord;
        const velocity:Coord = vel.trim().slice(2).split(",").map(s=>parseInt(s)) as Coord;
        robots.push(initRobot(position,velocity,maxX,maxY));
        }
    return robots;
}


const paintRobots = (robots:Robot[],maxX:number,maxY:number):string[][] =>{
    // make set of all robot coords
    const roboCoords = new Set<string>;
    for (const bot of robots){
        roboCoords.add(coordToString(bot.position))
    }

    const botMap: string[][] = [];
    for (let iY = 0; iY < maxY; iY ++){
        let row = [];
        for(let iX = 0; iX < maxX; iX ++){
            row.push(roboCoords.has(coordToString([iX,iY]))?"#":".");
        }
        botMap.push(row);
    }
   return botMap; 
}

const SEARCHFRAME = 101;
const renderBots = (robots:Robot[],seconds:number):void =>{
    const map = paintRobots(robots, robots[0].maxX, robots[1].maxY);
    if ((seconds - 80) % SEARCHFRAME === 0){
    console.log({[seconds]: map.map(r=> r.join("")).join("\n")});
    }
}

const main = async () => {
    const MAXX = 101;
    const MAXY = 103;
    const input = await readInput("./inputs/14.txt");
    const bots = createBotsFromInput(input,MAXX,MAXY);
    moveBots(bots,100);
    const quadrants = countQuadrants(bots,MAXX,MAXY);
    const p1 = quadrants.reduce((acc,cv)=> cv * acc);
    console.log({p1});
    const bots2 = createBotsFromInput(input,MAXX,MAXY);
    moveBots(bots2,SEARCHFRAME * 100, renderBots);
}


main();
