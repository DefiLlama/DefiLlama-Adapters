const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens } = require('../helper/sumTokens');

const bridge = "0xAB13B8eecf5AA2460841d75da5d5D861fD5B8A39";

async function tvl(api) {
    const balances = {};
    await sumTokens({
        api,
        balances,
        owners: [bridge],
        tokens: [ADDRESSES.ethereum.tBTC, ADDRESSES.ethereum.WBTC]
    })
    return balances
}

module.exports = {
    ethereum: { tvl }
}
