import {readInput} from "./readInput";

const inputPath = "./inputs/5.txt";
/**
An object with each page listing all the pages it must come before
**/
interface OrderingRules{
    [key: number] : number[]
    update: (before:number, after:number)=>void;
}
const initOrderingRules = ():OrderingRules =>{
    return {
        update(before,after){
            if (this[before] === undefined){
                this[before] = [];
            }
            this[before].push(after);
        }
    }
}

interface Update{
    pages: number[];
}


const readAndSplitInputSections = async (): Promise<string[]>=>{
    const inputString = await readInput(inputPath);
    const splitter = /^\n/gm;
    return inputString.trim().split(splitter);
}

const parseOrderingRules = (orderingSection:string):OrderingRules=>{
    const orderingRules = initOrderingRules();
    const rules = orderingSection.trim().split("\n");
    rules.forEach(rule=>{
        const [before,after] = rule.split("|").map(n=>parseInt(n));
        orderingRules.update(before,after);
        
    })
    return orderingRules;
}

const parseUpdates = (updateSection:string):Update[] => {
    return updateSection.trim().split("\n").map(u=>{
        return u.trim().split(",").reduce((acc:Update,cv)=>{
            acc.pages.push(parseInt(cv));
            return acc;
        }, {pages:[]});

    })
}

const testUpdate = (orderingRules:OrderingRules, update: Update):boolean => {
    const seen = new Set<number>;
    // check each page and see if anything it was supposed to come before has been seen
    for (const page of update.pages){
        const before = orderingRules[page];
        if (before === undefined){
            seen.add(page);
            continue;}
        for (const beforePage of before){
            if (seen.has(beforePage)){return false}
        }
        seen.add(page);
    }
    return true;
}

const getMiddlePageOfUpdates = (orderingRules:OrderingRules, updates: Update[]):number[] =>{
    return updates.map(u=>{
        const midIndex = Math.floor(u.pages.length / 2);
        return u.pages[midIndex];
    })
}

const reOrderBadUpdate = (orderingRules:OrderingRules, update:Update): Update =>{
    const fixedUpdatePages = [...update.pages];
    // iterate through update.pages, map indexes
    const pageMap = update.pages.reduce((map:{[key:number]:number},page,pageIndex)=> {map[page] = pageIndex; return map;}, {});
    // iterate through pages, checking rules
    // when encountering a rule(s) that is broken, swap the elements at each index
    let swap = true
     while(swap){
         swap = false
         for (const page of update.pages){
        const afterPages = orderingRules[page];
        if(afterPages === undefined){continue;}
        let currentIndex = pageMap[page];
        for (const afterPage of afterPages){
            // The afterPage is supposed to come AFTER the current page
            // check index of afterPage in current update
            let lowestIndex = currentIndex;
            const afterIndex = pageMap[afterPage];
            if (afterIndex === undefined){continue;} // Skip pages not in this update
            if (afterIndex < currentIndex){
                lowestIndex = Math.min(lowestIndex,afterIndex)
                // lowestIndex = Math.min(lowestIndex, afterIndex);
            }
            if(lowestIndex !== currentIndex){
                
                fixedUpdatePages[afterIndex] = page;
                fixedUpdatePages[currentIndex] = afterPage;
                pageMap[page] = afterIndex;
                pageMap[afterPage] = currentIndex;
                currentIndex = afterIndex;
                swap = true
            }
            
        }
        }
        // update map and update array
        // const lowestNumber = fixedUpdatePages[lowestIndex];
        // fixedUpdatePages[lowestIndex] = page;
        // fixedUpdatePages[currentIndex] = lowestNumber;
        // pageMap[page] = lowestIndex;
        // pageMap[lowestIndex] = currentIndex;
        // console.log({fixedUpdatePages});
        
    } 
    return {pages: fixedUpdatePages};
}



/*
18,15,13,47
18,15,47,13
18,47,15,13 << Result

18,47,13,15 << Expected
*/

async function main(){
    const [rulesInput,updatesInput] = await readAndSplitInputSections();
    const orderingRules = parseOrderingRules(rulesInput);
    const updates = parseUpdates(updatesInput);
    const goodUpdates = updates.filter(u=> testUpdate(orderingRules,u));
    const pages = getMiddlePageOfUpdates(orderingRules, goodUpdates);
    const sum = pages.reduce((sum,page)=>sum + page, 0);
    console.log("Part One:", {sum});

    const badUpdates = updates.filter(u=>!testUpdate(orderingRules,u));
    const fixedUpdates = badUpdates.map(u=>reOrderBadUpdate(orderingRules,u));
    console.log({fixed: fixedUpdates[0]});
    const fixedPages = getMiddlePageOfUpdates(orderingRules,fixedUpdates);
    const sum2 = fixedPages.reduce((sum,page)=> sum + page,0);
    console.log("Part 2:", {sum2});
}

main();
