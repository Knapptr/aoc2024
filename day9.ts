import {readInput} from "./readInput";

/*
create a result array of the correct length
create an array of empty space indicies
reverse empty space array
create an array of file blocks in order
pop from file block array, and put block into result array at popped space array 
*/

interface HardDisk{
    size: number
    blocks: Block[]
    emptyBlocks: Block[];
    fileBlocks: Block[];
}

interface FileBlock {
    id: number
    size: number
    index: number
}
interface EmptyBlock{ id: number, index:number, size: number}

interface Block{
    data: EmptyBlock | FileBlock
    type: "EMPTY" | "FILE"
}

const createFileBlock = (size:number,index:number, id:number):Block =>{return {type: "FILE", data:{size, id, index}}};
const createEmptyBlock = (size:number,  index:number, id:number): Block => {return {type:"EMPTY", data:{id, size,index}}};

const parse = async (path:string):Promise<HardDisk> =>{
    const input = await readInput(path);
    const blocks:Block[] = [];
    const emptyBlocks:Block[] = [];
    const fileBlocks:Block[] = [];

let currentFileId = 0;
let currentEmptyId = 0;
    input.trim().split("").forEach((char,index)=>{
        const isFile = index % 2 === 0;
        const blockSize = parseInt(char);
        for (let i = 0; i < blockSize; i++){
            if(isFile){
                const fileBlock = createFileBlock( blockSize, blocks.length, currentFileId);
                blocks.push(fileBlock)
                fileBlocks.push(fileBlock);
            }else{
                const emptyBlock = createEmptyBlock(blockSize, blocks.length,currentEmptyId);
                blocks.push(emptyBlock);
                emptyBlocks.push(emptyBlock);
            }
        }
        if(isFile){currentFileId += 1}else{currentEmptyId += 1}

    })

    return {
        blocks,
        emptyBlocks,
        fileBlocks,
        size: blocks.length
    }
}

const compress1 = (hd:HardDisk) =>{
    const revEmptyBlocks = [...hd.emptyBlocks].reverse();
    const fileBlocks = [...hd.fileBlocks];

    while (fileBlocks.at(-1)!.data.index > revEmptyBlocks.at(-1)!.data.index){
     let currentFileBlock = fileBlocks.pop()!;
     let currentEmptyBlock = revEmptyBlocks.pop()!;
        // console.log({currentFileBlock,currentEmptyBlock});
        // swap blocks
        hd.blocks[currentEmptyBlock.data.index] = currentFileBlock;
        hd.blocks[currentFileBlock.data.index] = currentEmptyBlock;
    // console.log({blocks: 
    //     hd.blocks.map(b=> b.type === "EMPTY"?".":b.type.id).join("")
    // });
    }
}

const toContiguous = (initBlocks:Block[]):Block[]=>{
    const blocks = [...initBlocks];
    // return only lowest index and size
    const contigBlocks = [];
    let i = 0;
    let currentContigId = -1;
    while (i < blocks.length){
        const currentBlock = blocks[i]
        if(currentContigId !== currentBlock.data.id){
            contigBlocks.push(currentBlock);
            currentContigId = currentBlock.data.id;
        }
        i++;
    }
    return contigBlocks

}

const compress2 = (hd:HardDisk) =>{
    const contigFiles = toContiguous(hd.fileBlocks) ;
    const contigEmpty = toContiguous(hd.emptyBlocks) ;

    for (let fi = contigFiles.length - 1 ; fi >=0; fi --){
    const currentAttemptedFile = contigFiles[fi];
        console.log("Current file", currentAttemptedFile.data.id, "-", currentAttemptedFile.data.size);
        for (let i = 0; i<contigEmpty.length; i++){
            const emptyTest = contigEmpty[i];
            const emptySpace = emptyTest.data.size;
            const fileSpace = currentAttemptedFile.data.size;
            if(emptySpace >= fileSpace){
                console.log("Found a space at: ", i);
                // handle incomplete fill
                const remainingSpace = emptySpace - fileSpace;
                if(remainingSpace === 0){
                    //remove empty space
                    contigEmpty.splice(i,1)
                }else{
                    //update empty space 
                    contigEmpty[i].data.size = remainingSpace;
                    contigEmpty[i].data.index += fileSpace;
                }
                break;
            }
        }
    console.log(contigEmpty);
    }
}
    const main = async () =>{
    const hd = await parse("./inputs/9.test.txt");
        compress1(hd);
        const checksum = hd.blocks.reduce((sum,file,i)=>{
            if(file.type !== "EMPTY"){sum += file.data.id * i}
            return sum;
        },0)
        console.log({P1: checksum});
    const hd2 = await parse("./inputs/9.test.txt");
        compress2(hd2);

}

main();
