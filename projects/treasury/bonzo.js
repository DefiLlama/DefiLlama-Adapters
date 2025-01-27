const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const tvl = async (api) => {
    const { reserves } = await getConfig('bonzo-treasury', "https://data.bonzo.finance/market");
    const treasury = '0x00000000000000000000000000000000005dc4d4'
    const tokens = reserves.map(reserve => [reserve.evm_address, reserve.atoken_address	]).flat()
    tokens.push(ADDRESSES.null)
    return api.sumTokens({ owner: treasury, tokens })
};

module.exports = {
    methodology: "The Treasury holds aToken balances, but reports using corresponding HTS token addresses to facilitate proper USD value calculations by DeFi Llama's pricing API.",
    hedera: {
        tvl
    }
};
