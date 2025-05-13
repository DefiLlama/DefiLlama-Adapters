const { aQuery, function_view } = require('../helper/chain/aptos')
const sdk = require('@defillama/sdk');

const addresses = {
    'aptos': {
        'moar': "0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07",
        'moar_package_owner': "0x37e9ce6910ceadd16b0048250a33dac6342549acf31387278ea0f95c9057f110",
    },
}
async function tvl(api, chain) {
    // TVL for moar means the unborrowed assets in the pools + all combined assets in the credit accounts
    const poolAddresses = await getPoolAddresses(chain)

    const balances = {};
    for (const poolAddress of poolAddresses) {
        const poolData = await aQuery(`/v1/accounts/${poolAddress}/resource/${addresses[chain]['moar']}::pool::Pool`, chain)

        if (!poolData['data']['is_paused']) {
            const idleAssetAmount = poolData['data']['total_deposited'] - poolData['data']['total_borrows']
            const assetMetadata = poolData['data']['underlying_asset']['inner']
            sdk.util.sumSingleBalance(balances, assetMetadata, idleAssetAmount, chain);
        }
    }

    const creditAccounts = await function_view({
        functionStr: `${addresses[chain]['moar']}::credit_manager::get_all_credit_accounts`,
        chain: chain
    })

    for (const creditAccount of creditAccounts) {
        const [_, assetData] = await function_view({
            functionStr: `${addresses[chain]['moar']}::lens::get_credit_account_debt_and_asset_amounts`,
            args: [creditAccount],
            chain: chain
        })
        for (const asset of assetData) {
            sdk.util.sumSingleBalance(balances, asset['asset']['inner'], asset['amount'], chain);
        }
    }

    return balances;
}

async function borrowed(api, chain) {
    const balances = {};

    const poolAddresses = await getPoolAddresses(chain)

    for (const poolAddress of poolAddresses) {
        const poolData = await aQuery(`/v1/accounts/${poolAddress}/resource/${addresses[chain]['moar']}::pool::Pool`, chain)

        if (!poolData['data']['is_paused']) {
            const borrowedAmount = poolData['data']['total_borrows']
            const assetMetadata = poolData['data']['underlying_asset']['inner']
            sdk.util.sumSingleBalance(balances, assetMetadata, borrowedAmount, chain);
        }
    }
    return balances;
}

async function getPoolAddresses(chain) {
    const poolsConfig = await aQuery(`/v1/accounts/${addresses[chain]['moar_package_owner']}/resource/${addresses[chain]['moar']}::pool::PoolConfigs`, chain)
    return poolsConfig['data']['all_pools']['inline_vec'].map(x => x['inner'])
}

module.exports = {
    timetravel: true,
    start: 1746403200,
    methodology: "Sums assets held by lending pools and all the assets held by all Credit Accounts.",
    aptos: {
        tvl: async (api) => tvl(api, 'aptos'),
        borrowed: async (api) => borrowed(api, 'aptos')
    },
}
