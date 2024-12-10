import {readInput} from "./readInput";
import parseGrid2D from "./helpers/parseGrid2D";

const parser = (char:string,rowI:number,charI:number):number =>{
    return parseInt(char);
}

type Coords = [number,number];
type VisitedSet = Set<string>;
interface TopoMap{
    grid: number[][];
    trailheads: Coords[];
}

const mapAtCoords = (map: number[][], coords:Coords):number=>{
    return map[coords[0]][coords[1]]
}
const coordsInBounds = (map:number[][], coords:Coords):boolean =>{
    if (coords[0] < 0 || coords[1] < 0){return false}
    if (coords[0] >= map.length || coords[1] >= map[0].length){return false}
    return true;
}

const stringifyCoords = (coords:Coords):string =>{
    return `${coords[0]},${coords[1]}`;
}

/* One could refactor this with DP */
const solve = (input:string) =>{
    const map = parseGrid2D(input,parser);
    // get all 0s (trailheads)
    // console.log({parsedAsGrid});
    const trailheads = map.reduce((acc:Coords[],row,ci)=>{
        return acc.concat(row.map((height,ri)=>[height,ri]).filter(([h])=>h===0).map(([_,i])=>[ci,i]))
    },[]);
    
    const trailheadStack: [Coords,VisitedSet][] = trailheads.map(t=>[t,new Set<string>])

    const trailheadScores: [Coords,Set<string>][] = [];
    const trailheadRatings: [Coords,number][] = [];

    while (trailheadStack.length > 0) {
        let rating = 0;
        // Set up stack
        const [currentTrailhead, visitedSet] = trailheadStack.pop()!;
        const accesibleNines = new Set<string>
        visitedSet.add(stringifyCoords(currentTrailhead));
        const routeStack:[Coords,VisitedSet][] = [[currentTrailhead,visitedSet]];
        // iterate
        while (routeStack.length > 0){
            const [currentStep,visited] = routeStack.pop()!;
            visited.add(stringifyCoords(currentStep));
            const currentHeight = mapAtCoords(map,currentStep) ;
            if (currentHeight === 9){
                accesibleNines.add(stringifyCoords(currentStep));
                rating += 1;
                continue;
            }

            const neighborDeltas = [[0,1],[0,-1],[1,0],[-1,0]];
            for (let nDelta of neighborDeltas){
                const nCoord:Coords = [currentStep[0] + nDelta[0], currentStep[1] + nDelta[1]];
                if (coordsInBounds(map,nCoord) && !visited.has(stringifyCoords(nCoord))){
                    const neighborHeight = mapAtCoords(map,nCoord);
                    if(neighborHeight - currentHeight === 1){
                        routeStack.push([nCoord, new Set([...visited])])
                    }
                }
            }
        }

        trailheadScores.push([currentTrailhead, accesibleNines]);
        trailheadRatings.push([currentTrailhead,rating]);
    }
    const scoreSum = trailheadScores.reduce((sum,[c,s])=> sum + s.size,0 );
    const ratingSum = trailheadRatings.reduce((sum,[c,r])=> sum + r, 0)
    console.log({pt1: scoreSum});
    console.log({pt2: ratingSum});
}
const main = async () => {
    const input = await readInput("./inputs/10.txt");
    solve(input);
}

main();


