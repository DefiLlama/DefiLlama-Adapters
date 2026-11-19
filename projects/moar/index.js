const { aQuery, function_view } = require('../helper/chain/aptos')

const addresses = {
    'aptos': {
        'moar': "0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07",
        'moar_lens': "0xfa3d17dfdf5037ed9b68c2c85976f899155048fdf96bc77b57ef1ad206c5b007",
        'moar_package_owner': "0x37e9ce6910ceadd16b0048250a33dac6342549acf31387278ea0f95c9057f110",
    },
}

// tvl and borrowed read the same pool set, so fetch it once per chain and share it
// between the two exports of the same run
const POOLS_TTL_MS = 5 * 60 * 1000
const poolsCache = {}

function getPools(chain) {
    const cached = poolsCache[chain]
    if (cached && Date.now() - cached.at < POOLS_TTL_MS) return cached.promise
    const promise = _getPools(chain).catch(e => { delete poolsCache[chain]; throw e })
    poolsCache[chain] = { at: Date.now(), promise }
    return promise
}

async function _getPools(chain) {
    const poolsConfig = await aQuery(`/v1/accounts/${addresses[chain]['moar_package_owner']}/resource/${addresses[chain]['moar']}::pool::PoolConfigs`, chain)
    const poolAddresses = poolsConfig['data']['all_pools']['inline_vec'].map(x => x['inner'])
    const pools = []
    for (const poolAddress of poolAddresses) {
        const { data } = await aQuery(`/v1/accounts/${poolAddress}/resource/${addresses[chain]['moar']}::pool::Pool`, chain)
        if (data['is_paused']) continue
        pools.push({ asset: data['underlying_asset']['inner'], deposited: +data['total_deposited'], borrows: +data['total_borrows'] })
    }
    return pools
}

async function tvl(api, chain) {
    // TVL for moar means the unborrowed assets in the pools + all combined assets in the credit accounts
    for (const { asset, deposited, borrows } of await getPools(chain))
        api.add(asset, deposited - borrows)

    const creditAccounts = await function_view({
        functionStr: `${addresses[chain]['moar']}::credit_manager::get_all_credit_accounts`,
        chain: chain
    })

    for (const creditAccount of creditAccounts) {
        const assetData = await function_view({
            functionStr: `${addresses[chain]['moar_lens']}::lens::get_credit_account_combined_asset_amounts`,
            args: [creditAccount],
            chain: chain
        })
        for (const asset of assetData)
            api.add(asset['asset']['inner'], asset['amount'])
    }
}

async function borrowed(api, chain) {
    for (const { asset, borrows } of await getPools(chain))
        api.add(asset, borrows)
}

module.exports = {
    timetravel: true,
    start: '2025-05-05',
    methodology: "Sums assets held by lending pools and all the assets held by all Credit Accounts.",
    aptos: {
        tvl: async (api) => tvl(api, 'aptos'),
        borrowed: async (api) => borrowed(api, 'aptos')
    },
}
