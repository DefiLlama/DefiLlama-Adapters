import path from "path";

async function main(){
    const passedFile = path.resolve(process.cwd(), process.argv[2]);
    let module = {} as any;
    try {
        module = require(passedFile)
      } catch(e) {
        console.log(e)
      }
    const liqs = await module.ethereum.liquidations();
    //console.log(liqs)
    console.log(JSON.stringify(liqs).length)
    process.exit(0)
}
main()