import {readInput} from "./readInput";
import parseGrid2D from "./helpers/parseGrid2D";

type Coord = [number,number];

interface Map{
    cells: string[][];
    regions: Region[];
}

interface Region{
    coords: Coord[];
    crop: string
}

const coordInBounds = (map:any[][],coord:Coord):boolean =>{
    return coord[0] >= 0 && coord[0] < map.length && coord[1] >=0 && coord[1] < map[0].length
}
const getNeighborCoordsOrth = (coords:Coord):Coord[]=>{
    const directions = [
        [0,1],
        [0,-1],
        [1,0],
        [-1,0]
    ];
    return directions.map((d)=>{return [coords[0] + d[0], coords[1] + d[1]]})
}
const getNeighborCoordsAll = (map:any[][], coords:Coord):Coord[]=>{
    const directions = [
        [0,1],
        [0,-1],
        [1,0],
        [-1,0],
    ];
    const neighbors:Coord[] = [];
    for (const [dX, dY] of directions){
        const targetCoord:Coord = [coords[0] + dX, coords[1] + dY];
        if(coordInBounds(map,targetCoord)){neighbors.push(targetCoord)}
    }
    return neighbors;
}
const intoRegions = (input:string):Map =>{
    const cells = parseGrid2D(input,(c)=>c);
    const searchMap: (string|null)[][] = JSON.parse(JSON.stringify(cells)) // make 2d clone of map;
    const regions:Region[] = [];
    
    
    for(let ri = 0; ri < searchMap.length; ri++){
        for(let ci = 0; ci < searchMap[0].length;ci++){
            let currentCell = searchMap[ri][ci];
            if(currentCell === null){continue;}
            const currentRegion:Region = {crop:currentCell,coords:[]};
            const searchStack:Coord[] = [[ri,ci]];
            while(searchStack.length > 0){
                let coords =searchStack.pop()!;
                // check if coords are in this region
                currentCell = searchMap[coords[0]][coords[1]];
                if (currentCell === currentRegion.crop){
                    // add cell to current region
                    currentRegion.coords.push(coords);
                    // set cell in search map to null
                    searchMap[coords[0]][coords[1]] = null;
                    // add neighborss of this cell to search stack
                    searchStack.push(...getNeighborCoordsAll(searchMap,coords));
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
interface RegionData {area:number,perimeter:number,price:number};
const getRegionData = (map: string[][],region:Region):RegionData =>{
    const area = region.coords.length; 
    let perimeter = 0;
    // test each orthogonal edge and see if it is in the same crop
    for (const coord of region.coords){
        for (const neighbor of getNeighborCoordsOrth(coord)){
            if(!coordInBounds(map,neighbor)){perimeter += 1; continue;}
            if(getAtCoords(map,neighbor) !== getAtCoords(map,coord)){ perimeter += 1;}
        }
    }
    return {area,perimeter,price: area * perimeter}

}
const part1 = (input:string):number => {
    const mapped = intoRegions(input.trim());
    const regionData = mapped.regions.map(region => getRegionData(mapped.cells,region));
    console.log(regionData);
    return regionData.reduce((acc,d)=> d.price + acc,0);

    
}

const main = async () =>{
   const input = await readInput("./inputs/12.txt") ;
    const p1 = part1(input);
    console.log({p1});
}

main();
