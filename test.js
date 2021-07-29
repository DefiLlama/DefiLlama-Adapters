#!/usr/bin/env node
const path = require("path");
require('dotenv').config();
const { default: computeTVL } = require("@defillama/sdk/build/computeTVL");
const { getCurrentBlocks } = require("@defillama/sdk/build//computeTVL/blocks");
const { humanizeNumber } = require("@defillama/sdk/build//computeTVL/humanizeNumber");

async function getBlocks(){
    for(let i=0; i<5; i++){
        try{
            return await getCurrentBlocks();
        } catch(e){
            throw new Error("Couln't get block heights", e)
        }
    }
}

if (process.argv.length < 3) {
    console.error(`Missing argument, you need to provide the filename of the adapter to test.
    Eg: npx @defillama/sdk projects/myadapter.js`);
    process.exit(1);
}
const passedFile = path.resolve(process.cwd(), process.argv[2]);

(async () => {
    const importedModule = require(passedFile);
    let usdTvl;
    const { timestamp, ethereumBlock, chainBlocks } = await getBlocks();
    for(const tvlSection of Object.keys(importedModule)){
        const moduleToTest = (tvlSection === 'tvl' || tvlSection === 'fetch') ? importedModule : importedModule[tvlSection]
        if(typeof moduleToTest !== "object"){
            continue
        }
        console.log(`--- ${tvlSection} ---`)
        if (moduleToTest.fetch) {
            usdTvl = await moduleToTest.fetch(timestamp);
        } else if (moduleToTest.tvl) {
            let tvl = await moduleToTest.tvl(timestamp, ethereumBlock, chainBlocks);
            if (typeof tvl !== "object") {
                throw new Error("TVL returned is not a balances object");
            }
            usdTvl = (await computeTVL(tvl, "now", true)).usdTvl;
        } else {
            throw new Error("File must export either a property called tvl or one called fetch")
        }
        console.log("Total:", humanizeNumber(usdTvl));
    }
    process.exit(0);
})();
