/** Parses a string into a 2d grid, using the factory function to parse characters 
**/
const parseGrid2D = <T>(input:string, factory: (char:string,lineI:number,charI:number)=>T):T[][] =>{
    return input.trim().split("\n").map((line,lineI)=>{
        return line.split("").map((char,charI)=>{
            return factory(char,lineI,charI)
        })
    })
}

export default parseGrid2D;
