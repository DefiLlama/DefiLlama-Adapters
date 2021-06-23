#!/usr/bin/env node
const path = require("path");
require('dotenv').config();
const {default: computeTVL} = require("@defillama/sdk/build/computeTVL");
const { getCurrentBlocks } = require("@defillama/sdk/build//computeTVL/blocks");
const { humanizeNumber } = require("@defillama/sdk/build//computeTVL/humanizeNumber");


if (process.argv.length < 3) {
    console.error(`Missing argument, you need to provide the filename of the adapter to test.
    Eg: npx @defillama/sdk projects/myadapter.js`);
    process.exit(1);
}
const passedFile = path.resolve(process.cwd(), process.argv[2]);

(async () => {
    const moduleToTest = require(passedFile);
    let usdTvl;
    if (moduleToTest.fetch) {
        usdTvl = await moduleToTest.fetch();
    } else if (moduleToTest.tvl) {
        const { timestamp, ethereumBlock, chainBlocks } = await getCurrentBlocks();

        let tvl = await moduleToTest.tvl(timestamp, ethereumBlock, chainBlocks);
        if (typeof tvl !== "object") {
            throw new Error("TVL returned is not a balances object");
        }

        usdTvl = (await computeTVL(tvl, "now", true)).usdTvl;
    } else {
        throw new Error("File must export either a property called tvl or one called fetch")
    }
    console.log("Total:", humanizeNumber(usdTvl));
    process.exit(0);
})();
