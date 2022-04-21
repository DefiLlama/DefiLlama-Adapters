const {call, addTokenBalances, sumSingleBalance} = require('../helper/near')
const {default: BigNumber} = require("bignumber.js");

const BURROW_CONTRACT = 'contract.main.burrow.near'

async function tvl() {
    const balances = {}

    const assetsCallResponse = await call(BURROW_CONTRACT, 'get_assets_paged', {})
    const assets = assetsCallResponse
        .map(([asset]) => asset)
        .filter(asset => !/\.burrow\./.test(asset))  // Ignore all assets that can be considered native tokens
    await addTokenBalances(assets, BURROW_CONTRACT, balances)
    return balances
}

async function borrowed() {
    const balances = {}
    const assetsCallResponse = await call(BURROW_CONTRACT, 'get_assets_paged', {});
    /// asset[0] => token_id
    /// asset[1] => asset_info
    const assets = assetsCallResponse
        .filter(asset => !/\.burrow\./.test(asset[0]))  // Ignore all assets that can be considered native tokens

    const extraDecimals = {}
    let fetchExtraDecimals = assets.map(asset => geExtraDecimals(BURROW_CONTRACT, asset[0], extraDecimals));
    await Promise.all(fetchExtraDecimals);

    assets.map(asset => {
        let borrowed_balance = BigNumber(asset[1]?.borrowed?.balance).div(BigNumber(10).pow(extraDecimals[asset[0]]));
        sumSingleBalance(balances, asset[0], borrowed_balance.toFixed(0))
    })

    return balances
}

module.exports = {
    near: {
        tvl,
        borrowed
    },
    misrepresentedTokens: true,
    methodology: 'Summed up all the tokens deposited in their main lending contract'
};

async function geExtraDecimals(contract, token_id, extraDecimals) {
    let asset_info = await call(contract, "get_asset", {token_id});
    extraDecimals[token_id] = asset_info?.config?.extra_decimals;
}
