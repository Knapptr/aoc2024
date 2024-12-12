import {readInput} from "./readInput";

interface Stone {
    value: number
    inc():Stone;
    mult():Stone;
    split():[Stone,Stone];
    hasEvenDigitCount():boolean
    blink():Stone[];
    
}

const createStone = (value:number):Stone => {
    const stone = {
        value,
        inc():Stone{
            return createStone(this.value + 1);
        },
        mult():Stone{
            return createStone(this.value * 2024)
        },
        split():[Stone,Stone]{
            const valString = this.value.toString();
            const splitIndex = valString.length / 2;
            const [stoneL, stoneR] = [valString.slice(0,splitIndex),valString.slice(splitIndex)].map(v=>parseInt(v));
            return [createStone(stoneL),createStone(stoneR)] ;

        },
        hasEvenDigitCount():boolean{
            const valString = this.value.toString();
            return valString.length % 2 === 0;
        },
        blink():Stone[]{
            const newStones = [];
                if(this.value === 0){newStones.push(this.inc())}else if(this.hasEvenDigitCount()){
                    newStones.push(...this.split())
                }else{
                newStones.push(stone.mult());
                }
            return newStones;
        }
    }
    return stone
}


/** store the number of stones a stone turns into after x blinks with a key of "stoneval-blinks" */
type StoneCounter = Map<number,number>;

interface PlutoStones {
    stones: Stone[];
    blink():Stone[];
    countCached(count:number):number
}

const createPlutoStones = (stones:Stone[]):PlutoStones =>{
    const plutoStones:PlutoStones = {
        stones,
        blink(){
            const newStones = [];
            for (const stone of this.stones){
                if(stone.value === 0){newStones.push(stone.inc()); continue;}
                if(stone.hasEvenDigitCount()){
                    newStones.push(...stone.split())
                    continue;
                }
                newStones.push(stone.mult());
            }
            return newStones;
        },
        countCached(blinkCount:number = 0):number{
            // console.log({blinkCount});
            let stoneCounter: StoneCounter = new Map;
            let count = 0;
            for (let stone of this.stones){
                let currentValue = stoneCounter.get(stone.value) || 0;
                stoneCounter.set(stone.value, currentValue + 1);
            }

            for (let i = 0; i < blinkCount; i++){
                let newCounter = new Map;
                for (const [number,count] of stoneCounter.entries()){
                    let stone = createStone(number);
                    let newStones = stone.blink()
                    for (let newStone of newStones){
                        let currentValue = newCounter.get(newStone.value) || 0;
                        newCounter.set(newStone.value, currentValue +  count );
                    }
                }
                count = Array.from(newCounter.values()).reduce((acc,cv)=>acc + cv);
                stoneCounter = new Map(newCounter);
            }

            
            return count;
        }

    }
    return plutoStones;
}

const stonesFromInput = (input:string):PlutoStones => {
    const stones = input.trim().split(" ").map(s=> createStone(parseInt(s)))
    return createPlutoStones(stones);
}
const main = async () => {
    const input = await readInput("./inputs/11.txt");
    const plutoStones = stonesFromInput(input);
    const blinkCount = 25;
    for (let i = 0; i < blinkCount; i++){
        plutoStones.stones = plutoStones.blink();
    }
    console.log({p1: plutoStones.stones.length});
    const plutoStones2 = stonesFromInput(input);
    console.log({p2t: plutoStones2.countCached(75)});
}
 
main();

