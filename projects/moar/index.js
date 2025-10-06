const { aQuery, function_view } = require('../helper/chain/aptos')
const sdk = require('@defillama/sdk');

const addresses = {
    'aptos': {
        'moar': "0xa3afc59243afb6deeac965d40b25d509bb3aebc12f502b8592c283070abc2e07",
        'moar_lens': "0xfa3d17dfdf5037ed9b68c2c85976f899155048fdf96bc77b57ef1ad206c5b007",
        'moar_package_owner': "0x37e9ce6910ceadd16b0048250a33dac6342549acf31387278ea0f95c9057f110",
        'goblin': "0x19bcbcf8e688fd5ddf52725807bc8bf455a76d4b5a6021cfdc4b5b2652e5cd55",
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
        try {
            const assetData = await function_view({
                functionStr: `${addresses[chain]['moar_lens']}::lens::get_credit_account_combined_asset_amounts`,
                args: [creditAccount],
                chain: chain
            })
            for (const asset of assetData) {
                sdk.util.sumSingleBalance(balances, asset['asset']['inner'], asset['amount'], chain);
            }
        } catch (error) {
            console.error('Failed to fetch balances for credit account', creditAccount)
        }
    }

    // convert goblin LP tokens to their underlying tokens
    for (const asset in balances) {
        const metadataAddress = asset.split(":")[1]
        let getVaultTokenResponse
        try {
            getVaultTokenResponse = await function_view({
                functionStr: `0x19bcbcf8e688fd5ddf52725807bc8bf455a76d4b5a6021cfdc4b5b2652e5cd55::vaults::get_vault_token_ab`,
                args: [metadataAddress],
                chain: chain
            })
        } catch (error) {
            // not goblin LP token; ignore
            continue;
        }
        const tokenA = getVaultTokenResponse[0].inner
        const tokenB = getVaultTokenResponse[1].inner

        const [tokenABalance, tokenBBalance] = await function_view({
            functionStr: `${addresses[chain]['goblin']}::vaults::get_token_amount_by_share`,
            args: [metadataAddress, balances[asset]],
            chain: chain
        })

        sdk.util.sumSingleBalance(balances, tokenA, tokenABalance, chain);
        sdk.util.sumSingleBalance(balances, tokenB, tokenBBalance, chain);
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
