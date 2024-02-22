const sdk = require('@defillama/sdk');

async function taiSupply(timestamp, ethBlock, {tomochain: block}) {
    const taiContract = '0x4d04315e6BABD038d15ea0E240A88B292d2Add41';

    const supply = (await sdk.api.erc20.totalSupply({
        target: taiContract,
        block: block,
        chain: 'tomochain',
        decimals: 18
    })).output;
    console.log(supply,'##supply')
    return { 'usd-coin': supply };
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    tomochain: {
        tvl: taiSupply
    }
};
