const ADDRESSES = require('../helper/coreAssets.json')
const { post } = require('../helper/http')

// Production afLP vault after the relaunch.
const AFLP_VAULT_ID = '0x294d0b728cb56759a6686ea0ca672a8f7e66f84f0a426a490377ed939f0ef604'

/**
 * Adds the production afLP vault's API-reported NAV in USD, including idle
 * collateral and deployed positions with unrealized PnL and funding.
 * @param {import('@defillama/sdk').ChainApi} api - Sui TVL balance accumulator.
 * @returns {Promise<void>}
 * @throws {Error} If the request fails or the vault identity, collateral, or TVL is invalid.
 */
async function tvl(api) {
    const { vaults } = await post('https://aftermath.finance/api/perpetuals/vaults', {
        vaultIds: [AFLP_VAULT_ID],
    }, { timeout: 30000 })

    if (!Array.isArray(vaults) || vaults.length !== 1 || vaults[0]?.objectId !== AFLP_VAULT_ID)
        throw new Error('Expected the production Aftermath afLP vault in the API response')

    const vault = vaults[0]
    if (vault.collateralCoinType !== ADDRESSES.sui.USDC_CIRCLE)
        throw new Error('Unexpected collateral coin type for the Aftermath afLP vault')
    if (!Number.isFinite(vault.tvlUsd) || vault.tvlUsd < 0)
        throw new Error('Invalid TVL for the Aftermath afLP vault')

    api.addUSDValue(vault.tvlUsd)
}

module.exports = {
    methodology: "Tracks the USD value of idle USDC collateral and deployed positions, including unrealized PnL and funding, in Aftermath's production afLP vault using the Aftermath API.",
    timetravel: false,
    sui: {
        tvl,
    }
}
