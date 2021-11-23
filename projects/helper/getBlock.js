const sdk = require('@defillama/sdk')
const retry = require('async-retry')
const axios = require("axios");

async function getBlock(timestamp, chain, chainBlocks, undefinedOk = false) {
    if (chainBlocks[chain] !== undefined || (process.env.HISTORICAL === undefined && undefinedOk)) {
        return chainBlocks[chain]
    } else {
        if(chain === "celo"){
            return Number((await retry(async bail => await axios.get("https://explorer.celo.org/api?module=block&action=getblocknobytime&timestamp=" + timestamp + "&closest=before"))).data.result.blockNumber);
        }
        return sdk.api.util.lookupBlock(timestamp, { chain }).then(blockData => blockData.block)
    }
}

module.exports = {
    getBlock,
};