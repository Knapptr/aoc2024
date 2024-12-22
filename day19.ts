import {readInput} from "./readInput";

const parseInput = (input:string): [Map<string,string[]>, string[]] =>{
    const [available,desired] = input.trim().split("\n\n");

    const availableMap = available.split(",").reduce((acc,cv)=>{
        const current = cv.trim()
        if(!acc.has(current[0])){acc.set(current[0], [])};
        acc.get(current[0])!.push(current.slice(1));
        return acc
    }, new Map<string,string[]>);

    const desiredList = desired.split("\n");
    return [availableMap, desiredList];
}

const countPossibilites = (desired:string, available: Map<string,string[]>, cache: Map<string,number> = new Map):number =>{
    if(cache.has(desired)){
        return cache.get(desired)!
    }
    let count = 0;
    if(desired.length === 0){return  1}
    const firstChar = desired[0];
    const potentialSubs = available.get(firstChar);
    if(!potentialSubs){return 0}
    for(const sub of potentialSubs){
        const remainingDesired = desired.slice(1);
        if(remainingDesired.startsWith(sub)){
             count += countPossibilites(remainingDesired.slice(sub.length), available, cache);
        }
    }

    cache.set(desired,count);
    return count
    
}
const testString = (desired:string, available: Map<string,string[]>, tested: Map<string,number>):boolean =>{
    console.log({tested});
    if(desired.length === 0){
        console.log("sol");
        return true};
    if(tested.has(desired)){
        const solutionCount = tested.get(desired)!;
        if(tested.get(desired)! > 0){
            for(let i = 0; i < solutionCount; i++){
                console.log("sol")
            }
        }
        return solutionCount > 0;
    }
    const firstChar = desired[0];
    const subSeqs = available.get(firstChar);
    if(!subSeqs){return false};

    let permutationCount = 0;
    for(const sub of subSeqs){
        const remainingDesired = desired.slice(1);
        if(remainingDesired.startsWith(sub)){
            // test next char
            if(testString(remainingDesired.slice(sub.length),available,tested)){
                permutationCount += 1;
            }
        }
    }
    const oldCount = tested.get(desired) || 0;
    tested.set(desired,permutationCount + oldCount);
    return permutationCount > 0;
}
const solve = (input:string):number => {
    const [available,desired] = parseInput(input);
    let p1count = 0;
    const tested = new Map<string,number>;
for(const desiredString of desired){
if(testString(desiredString, available,tested)){
    p1count += 1;
}
}
return p1count;
}
const main = async () =>{
    const input = await readInput("./inputs/19.txt");
    const [available,desired] = parseInput(input);
    const cache = new Map<string,number>;
    const p2 = desired.map(d=>countPossibilites(d,available,cache)).reduce((acc,cv)=>acc+cv);
    console.log({p2});
    // const part1 = solve(input);
    // console.log({part1});
}
main();
