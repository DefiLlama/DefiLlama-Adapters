const sdk = require('@defillama/sdk');

// Import vault TVL calculation functions
const { processVaults } = require('./vaults/morpho');
const { hypercoreHwhlpVaultTvl, hyperCoreSpotBalance } = require('./hypercore/index');
const { mainnetHwhlpVaultTvl, hwhlpVaultTvl, hwhypeVaultTvl } = require('./vaults/erc20');

module.exports = {
    timetravel: false,
    methodology: 'TVL represents the sum of tokens deposited in the vault + HLP positions + HyperCore Spot positions.',
    doublecounted: false,
    ethereum: { tvl: mainnetHwhlpVaultTvl },
    arbitrum: { tvl: hypercoreHwhlpVaultTvl },
    hyperliquid: { 
        tvl: sdk.util.sumChainTvls([
            hwhlpVaultTvl,
            hyperCoreSpotBalance,
            hwhypeVaultTvl,
            processVaults
        ])
    },
};