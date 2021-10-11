const sdk = require('@defillama/sdk')
const retry = require('async-retry')
const axios = require("axios");

async function getBlock(timestamp, chain, chainBlocks) {
    if(chain === "celo"){
        return Number((await retry(async bail => await axios.get("https://explorer.celo.org/api?module=block&action=getblocknobytime&timestamp=" + timestamp + "&closest=before"))).data.result.blockNumber);
    }
    if (chainBlocks[chain] !== undefined) {
        return chainBlocks[chain]
    } else {
        return sdk.api.util.lookupBlock(timestamp, { chain }).then(blockData => blockData.block)
    }
}

module.exports = {
    getBlock,
};