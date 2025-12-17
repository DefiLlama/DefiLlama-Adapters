const sdk = require('@defillama/sdk');

// Import vault TVL calculation functions
const { hyperevmHwhypeMorphoTvl, hyperevmHwusdMorphoTvl, mainnetHwusdMorphoTvl, baseHwusdMorphoTvl } = require('./evm/morpho');
const { hypercoreHwhlpVaultTvl, hyperCoreSpotBalance } = require('./hypercore/index');
const { mainnetHwhlpVaultTvl, hwhlpVaultTvl, hwhypeVaultTvl, mainnetHwusdVaultTvl, hyperevmHwhusdVaultTvl, baseHwusdVaultTvl } = require('./evm/erc20');
const { khypeUnstaking } = require('./evm/khype');
const { behypeUnstaking } = require('./evm/behype');
const { vkhypeUnstaking } = require('./evm/vkhype');

module.exports = {
    timetravel: false,
    methodology: 'TVL represents the sum of tokens deposited in the vault + HLP positions + HyperCore Spot positions.',
    doublecounted: false,
    ethereum: { 
        tvl: sdk.util.sumChainTvls([
            // hwHLP
            mainnetHwhlpVaultTvl,
            // hwUSD
            mainnetHwusdVaultTvl,
            mainnetHwusdMorphoTvl,
        ]) 
    },
    base: { 
        tvl:sdk.util.sumChainTvls([
            // hwUSD
            baseHwusdVaultTvl,
            baseHwusdMorphoTvl,
        ])
    },
    arbitrum: { tvl: hypercoreHwhlpVaultTvl },
    hyperliquid: { 
        tvl: sdk.util.sumChainTvls([
            // hwHLP
            hwhlpVaultTvl,
            hyperCoreSpotBalance,
            // hwHYPE
            hwhypeVaultTvl,
            hyperevmHwhypeMorphoTvl,
            khypeUnstaking,
            behypeUnstaking,
            vkhypeUnstaking,
            // hwUSD
            hyperevmHwhusdVaultTvl,
            hyperevmHwusdMorphoTvl,
        ])
    },
};