import {readInput} from "./readInput"
import parseGrid2D from "./helpers/parseGrid2D";
type Coords = [number,number];

interface Antenna{
     coords: Coords,
    frequency: string
}

interface Node{
    antenna: Antenna | null,
    antiNodes: string[],
}

const createEmptyNode = ():Node =>{return {antenna:null,antiNodes:[]}}
const createAntennaNode = (char:string,coords:Coords):Node =>{return {antenna:createAntenna(char,coords),antiNodes:[]}}
const createAntenna = (frequency:string,coords:Coords):Antenna =>{
    return {frequency,coords}
}

type NodeMap =  Node[][];

const calculateLRAntiNodeCoords = (lhs:Coords, rhs:Coords):[Coords,Coords]=>{
    const [vectorY,vectorX] = [lhs[0]-rhs[0],  lhs[1]-rhs[1]];
    const [deltaY,deltaX] = [Math.abs(vectorY), Math.abs(vectorX)];
    const antiLeft:Coords = [lhs[0]  + vectorY, lhs[1] + vectorX];
    const antiRight:Coords = [rhs[0]  - vectorY, rhs[1] - vectorX];
    return [antiLeft,antiRight];
}
const calculateContinuousAntiNodeCoords = (lhs:Coords, rhs:Coords, map:NodeMap):Coords[]=>{
    const allCoords = [lhs,rhs] ;
    const [vectorY,vectorX] = [lhs[0]-rhs[0],  lhs[1]-rhs[1]];
    let antiLeft:Coords = [lhs[0]  + vectorY, lhs[1] + vectorX];
    while(checkCoordInBounds(map,antiLeft)){
        allCoords.push(antiLeft);
        antiLeft = [antiLeft[0]  + vectorY, antiLeft[1] + vectorX];
    }
    let antiRight:Coords = [rhs[0]  - vectorY, rhs[1] - vectorX];
    while(checkCoordInBounds(map,antiRight)){
        allCoords.push(antiRight);
    antiRight = [antiRight[0]  - vectorY, antiRight[1] - vectorX];
    }
    return allCoords;
}

const parseChar = (char:string,lineI:number,charI:number):Node =>{
    switch (char){
        case '.': return createEmptyNode();
        default: return createAntennaNode(char,[lineI,charI])
    }
}
const parse = (input:string):NodeMap =>{
    return parseGrid2D(input,parseChar)
}

const getAllFrequencyAntinodesPt1 = (antennas:Antenna[]):Coords[]=>{
    let antiNodes:Coords[] = [];
    const ants = [...antennas]; // clone so to not mutate the original array
    while (ants.length > 0){
        const rhs = ants.pop()!;
        ants.forEach(lhs=>{
            antiNodes = [...antiNodes, ...calculateLRAntiNodeCoords(lhs.coords,rhs.coords)]
        })

    }
    return antiNodes
}
const getAllFrequencyAntinodesPt2 = (antennas:Antenna[],map:NodeMap):Coords[]=>{
    let antiNodes:Coords[] = [];
    const ants = [...antennas]; // clone so to not mutate the original array
    while (ants.length > 0){
        const rhs = ants.pop()!;
        ants.forEach(lhs=>{
            antiNodes = [...antiNodes, ...calculateContinuousAntiNodeCoords(lhs.coords,rhs.coords,map)]
        })

    }
    return antiNodes
}

const stringifyCoords = (coords:Coords):string=>{
    return `${coords[0]},${coords[1]}`;
}

const checkCoordInBounds = (nodeMap:NodeMap,coords:Coords):boolean =>{
    const [limY,limX] = [nodeMap.length,nodeMap[0].length];
    return coords[0] >= 0 && coords[0] < limY && coords[1] >= 0 && coords[1] < limX;
}
const solve1 = (nodeMap:NodeMap):number=>{
    const uniqueLocations = new Set<string>
    const freqMap:RadioFreqMap = {};
    // map frequencies
    nodeMap.forEach(row=>{
        row.forEach(node=>{
            if(node.antenna !== null){
                if(freqMap[node.antenna.frequency] === undefined){
                    freqMap[node.antenna.frequency] = [];
                }
                    freqMap[node.antenna.frequency].push(node.antenna);
            }
        })
    })
    for (const antennaList of Object.values(freqMap)){
       const allAntis =  getAllFrequencyAntinodesPt1(antennaList);
        allAntis.forEach(coord=>{
            if(checkCoordInBounds(nodeMap,coord)){
            uniqueLocations.add(stringifyCoords(coord));
            }
        })
    }
    return uniqueLocations.size
}
const solve2 = (nodeMap:NodeMap):number=>{
    const uniqueLocations = new Set<string>
    const freqMap:RadioFreqMap = {};
    // map frequencies
    nodeMap.forEach(row=>{
        row.forEach(node=>{
            if(node.antenna !== null){
                if(freqMap[node.antenna.frequency] === undefined){
                    freqMap[node.antenna.frequency] = [];
                }
                    freqMap[node.antenna.frequency].push(node.antenna);
            }
        })
    })
    for (const antennaList of Object.values(freqMap)){
       const allAntis =  getAllFrequencyAntinodesPt2(antennaList,nodeMap);
        allAntis.forEach(coord=>{
            uniqueLocations.add(stringifyCoords(coord));
        })
    }
    return uniqueLocations.size
}

/** Sorted frequency locations on map
*/
type RadioFreqMap = {[key:string]:Antenna[]};
const  main = async () =>{
    const input = await readInput("./inputs/8.txt");
    const map = parse(input);
    const pt1 = solve1(map);
    console.log({pt1});
    const pt2 = solve2(map);
    console.log({pt2});
}

main();
