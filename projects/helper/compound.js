const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abis/compound.json');

// ask comptroller for all markets array
async function getAllCTokens(comptroller, block, chain) {
    return (await sdk.api.abi.call({
        block,
        target: comptroller,
        params: [],
        abi: abi['getAllMarkets'],
        chain
    })).output;
}

async function getUnderlying(block, chain, cToken) {
    if (cToken === '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5') {
        return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';//cETH => WETH
    }

    return (await sdk.api.abi.call({
        block,
        target: cToken,
        abi: abi['underlying'],
        chain
    })).output;
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(comptroller, block, chain) {
    let allCTokens = await getAllCTokens(comptroller, block, chain);
    const markets = []
    // if not in cache, get from the blockchain
    await (
        Promise.all(allCTokens.map(async (cToken) => {
            let underlying = await getUnderlying(block, chain, cToken);
            markets.push({ underlying, cToken })
        }))
    );

    return markets;
}

function getCompoundV2Tvl(comptroller, chain, transformAdress = addr=>addr) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        let balances = {};
        let markets = await getMarkets(comptroller, block, chain);

        // Get V2 tokens locked
        let v2Locked = await sdk.api.abi.multiCall({
            block,
            chain,
            calls: _.map(markets, (market) => ({
                target: market.cToken,
            })),
            abi: abi['getCash'],
        });

        _.each(markets, (market) => {
            let getCash = _.find(v2Locked.output, (result) => result.input.target === market.cToken);

            sdk.util.sumSingleBalance(balances, transformAdress(market.underlying), getCash.output)
        });
        return balances;
    }
}

module.exports = {
    getCompoundV2Tvl,
};
