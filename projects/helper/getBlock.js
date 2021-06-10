const sdk = require('@defillama/sdk')

async function getBlock(timestamp, chain, chainBlocks) {
    if (chainBlocks[chain] !== undefined) {
        chainBlocks[chain]
    } else {
        return sdk.api.util.lookupBlock(timestamp, { chain }).then(blockData => blockData.block)
    }
}

module.exports = {
    getBlock,
};