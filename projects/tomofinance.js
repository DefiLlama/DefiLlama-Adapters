const { getBlock } = require('./helper/getBlock')
const sdk = require('@defillama/sdk');

async function taiSupply(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, 'tomochain', chainBlocks);
    const taiContract = '0x4d04315e6BABD038d15ea0E240A88B292d2Add41';

    const supply = (await sdk.api.erc20.totalSupply({
        target: taiContract,
        block: block,
        chain: 'tomochain',
        decimals: 18
    })).output;

    return { 'usd-coin': supply };
};

module.exports = {
    misrepresentedTokens: true,
    tomochain: {
        tvl: taiSupply
    }
};