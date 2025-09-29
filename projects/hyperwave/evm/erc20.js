const { sumTokens2 } = require('../../helper/unwrapLPs');
const { HWLP_VAULT, MAINNET_HWLP_VAULT_TOKENS, HWLP_VAULT_TOKENS, HWHYPE_VAULT, HWHYPE_VAULT_TOKENS } = require('../constants');

/**
 * Calculate TVL for HWHLP vault on HyperLiquid chain
 */
async function hwhlpVaultTvl(api) {
    return sumTokens2({
        api,
        owner: HWLP_VAULT,
        chain: 'hyperliquid',
        tokens: HWLP_VAULT_TOKENS,
    });
}

/**
 * Calculate TVL for HWHLP vault on Ethereum mainnet
 */
async function mainnetHwhlpVaultTvl(api) {
    return sumTokens2({
        api,
        owner: HWLP_VAULT,
        chain: 'ethereum',
        tokens: MAINNET_HWLP_VAULT_TOKENS
    });
}


/**
 * Calculate TVL for HWHYPE vault on HyperLiquid chain
 */
async function hwhypeVaultTvl(api) {
    return sumTokens2({
        api,
        owner: HWHYPE_VAULT,
        chain: 'hyperliquid',
        tokens: HWHYPE_VAULT_TOKENS,
    });
}


module.exports = {
    hwhlpVaultTvl,
    mainnetHwhlpVaultTvl,
    hwhypeVaultTvl,
};