const sdk = require('@defillama/sdk')
const { get } = require('./http')

async function getBlock(timestamp, chain, chainBlocks, undefinedOk = false) {
    if (chainBlocks[chain] !== undefined || (process.env.HISTORICAL === undefined && undefinedOk)) {
        return chainBlocks[chain]
    } else {
        if(chain === "celo"){
            return Number((await get("https://explorer.celo.org/api?module=block&action=getblocknobytime&timestamp=" + timestamp + "&closest=before")).result.blockNumber);
        } else if(chain === "moonriver") {
            return Number((await get(`https://blockscout.moonriver.moonbeam.network/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`)).result.blockNumber);
        }
        return sdk.api.util.lookupBlock(timestamp, { chain }).then(blockData => blockData.block)
    }
}

module.exports = {
    getBlock,
};