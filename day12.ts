import {readInput} from "./readInput";
import parseGrid2D from "./helpers/parseGrid2D";

type Coord = [number,number];

interface FarmMap{
    cells: string[][];
    regions: Region[];
}

interface Region{
    coords: Set<string>
    crop: string
}
interface Edge {
    coord: Coord
    top: boolean
    bottom: boolean
    left: boolean
    right: boolean
}

const coordInBounds = (map:any[][],coord:Coord):boolean =>{
    return coord[0] >= 0 && coord[0] < map.length && coord[1] >=0 && coord[1] < map[0].length
}
type EdgeDir = "top"|"bottom" | "left" | "right";
const getNeighborCoords = (map:any[][], coords:Coord):[Coord,EdgeDir][]=>{
    const directions:[Coord,EdgeDir][] = [
        [[1,0], "bottom"],
        [[-1,0], "top"],
        [[0,1],"right"],
        [[0,-1], "left"],
    ];
    const neighbors:[Coord,EdgeDir][] = [];
    for (const [[dX, dY],edgeDir] of directions){
        const targetCoord:Coord = [coords[0] + dX, coords[1] + dY];
        neighbors.push([targetCoord,edgeDir]);
    }
    return neighbors;
}
const coordsToString = (coords:Coord):string =>{
    return `${coords[0]},${coords[1]}`;
}
const coordsFromString = (string:string): Coord =>{
    return string.split(",").map(s=>parseInt(s)) as Coord
}
const intoRegions = (input:string):FarmMap =>{
    const cells = parseGrid2D(input,(c)=>c);
    const searchMap: (string|null)[][] = JSON.parse(JSON.stringify(cells)) // make 2d clone of map;
    const regions:Region[] = [];
    
    
    for(let ri = 0; ri < searchMap.length; ri++){
        for(let ci = 0; ci < searchMap[0].length;ci++){
            let currentCell = searchMap[ri][ci];
            if(currentCell === null){continue;}
            const currentRegion:Region = {crop:currentCell,coords:new Set};
            const searchStack:Coord[] = [[ri,ci]];
            while(searchStack.length > 0){
                let coords =searchStack.pop()!;
                // check if coords are in this region
                currentCell = searchMap[coords[0]][coords[1]];
                if (currentCell === currentRegion.crop){
                    // add cell to current region
                    currentRegion.coords.add(coordsToString(coords));
                    // set cell in search map to null
                    searchMap[coords[0]][coords[1]] = null;
                    // add neighborss of this cell to search stack
                    const neighborCoords =getNeighborCoords(searchMap,coords).filter(([c])=> coordInBounds(searchMap,c)).map(([c])=> c);
                    searchStack.push(...neighborCoords);
                }
            }
            if(currentRegion !== null){regions.push(currentRegion)}
        }
    }
    return {cells,regions}
}

const getAtCoords = (map:string[][],coords:Coord):string =>{
    return map[coords[0]][coords[1]];
}
interface RegionData {area:number,perimeter:number,price:number,edges: Map<string,Edge>};
const getRegionData = (map: string[][],region:Region):RegionData =>{
    const area = region.coords.size;
    let perimeter = 0;
    const edges: Map<string,Edge> = new Map;
    // test each orthogonal edge and see if it is in the same crop
    for (const coordString of region.coords.values()){
        const coord = coordsFromString(coordString);
        for (const [neighbor,direction] of getNeighborCoords(map,coord)){
            if(region.coords.has(coordsToString(neighbor))){continue;}
            
            if(!edges.has(coordString)){ edges.set(coordString,{coord: coord, top:false,bottom:false,left:false,right:false})};
            edges.set(coordString, {...edges.get(coordString)!, [direction]: true});
            if(!coordInBounds(map,neighbor)){perimeter += 1; continue;}
            if(getAtCoords(map,neighbor) !== getAtCoords(map,coord)){ perimeter += 1;}
        }
    }
    return {area,perimeter,price: area * perimeter,edges}

}

const getNumberOfEdges = (edges: Map<string,Edge>):number => {
    let edgeCount = 0;
    for (const edge of edges.values()){
        // if top edge check if l, r neighbors  in edge list and is top edge, unset the edge flag on that edge to remove from being counted again
        let currentEdge: Edge | undefined  = edge;
        // Left Checks
        if (edge.top){
            edgeCount += 1;
            let leftNbor = edges.get(coordsToString([edge.coord[0], edge.coord[1] - 1]));
            while (leftNbor && leftNbor.top){
                leftNbor.top = false
                leftNbor = edges.get(coordsToString([leftNbor.coord[0], leftNbor.coord[1] - 1]))
            }
            let  rightNbor = edges.get(coordsToString([edge.coord[0], edge.coord[1] + 1]));
            while (rightNbor && rightNbor.top){
                rightNbor.top = false
                rightNbor = edges.get(coordsToString([rightNbor.coord[0], rightNbor.coord[1] + 1]))
            }
    }
        if (edge.bottom){
            edgeCount += 1;
            let leftNbor = edges.get(coordsToString([edge.coord[0], edge.coord[1] - 1]));
            while (leftNbor && leftNbor.bottom){
                leftNbor.bottom = false;
                leftNbor = edges.get(coordsToString([leftNbor.coord[0], leftNbor.coord[1] - 1]));
            }
            let  rightNbor = edges.get(coordsToString([edge.coord[0], edge.coord[1] + 1]));
            while (rightNbor && rightNbor.bottom){
                rightNbor.bottom = false
                rightNbor = edges.get(coordsToString([rightNbor.coord[0], rightNbor.coord[1] + 1]))
            }
    }
        if (edge.left){
            edgeCount += 1;
            let upNbor = edges.get(coordsToString([edge.coord[0] - 1, edge.coord[1]]));
            while (upNbor && upNbor.left){
                upNbor.left = false;
                upNbor = edges.get(coordsToString([upNbor.coord[0] -1 , upNbor.coord[1]]));
            }
            let  dnNbor = edges.get(coordsToString([edge.coord[0] + 1, edge.coord[1] ]));
            while (dnNbor && dnNbor.left){
                dnNbor.left = false
                dnNbor = edges.get(coordsToString([dnNbor.coord[0] + 1, dnNbor.coord[1]]))
            }
    }
        if (edge.right){
            edgeCount += 1;
            let upNbor = edges.get(coordsToString([edge.coord[0] - 1, edge.coord[1]]));
            while (upNbor && upNbor.right){
                upNbor.right = false;
                upNbor = edges.get(coordsToString([upNbor.coord[0] -1 , upNbor.coord[1]]));
            }
            let  dnNbor = edges.get(coordsToString([edge.coord[0] + 1, edge.coord[1] ]));
            while (dnNbor && dnNbor.right){
                dnNbor.right = false
                dnNbor = edges.get(coordsToString([dnNbor.coord[0] + 1, dnNbor.coord[1]]))
            }
    }
        }
    return edgeCount;
}
const part1 = (input:string):number => {
    const mapped = intoRegions(input.trim());
    const regionData = mapped.regions.map(region => getRegionData(mapped.cells,region));
    return regionData.reduce((acc,d)=> d.price + acc,0);

    
}
const part2 = (input:string):number => {
    const mapped = intoRegions(input.trim());
    const regionData = mapped.regions.map(region => getRegionData(mapped.cells,region));
    const prices = regionData.map(region => region.area * getNumberOfEdges(region.edges));
    return prices.reduce((acc,p)=>p +  acc);

}

const main = async () =>{
   const input = await readInput("./inputs/12.txt") ;
    const p1 = part1(input);
    console.log({p1});
    const p2 = part2(input);
    console.log({p2});
}

main();
