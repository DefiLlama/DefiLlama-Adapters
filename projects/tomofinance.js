const sdk = require('@defillama/sdk');

async function taiSupply(timestamp, ethBlock, {tomochain: block}) {
    const taiContract = '0x4d04315e6BABD038d15ea0E240A88B292d2Add41';

    const supply = (await sdk.api.erc20.totalSupply({
        target: taiContract,
        block: block,
        chain: 'tomochain',
        decimals: 18
    })).output;

    return { 'usd-coin': supply };
}

module.exports = {
        misrepresentedTokens: true,
    tomochain: {
        tvl: taiSupply
    }
};
