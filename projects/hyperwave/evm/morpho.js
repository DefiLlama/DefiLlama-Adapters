const sdk = require('@defillama/sdk');
const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { HWHYPE_META_MORPHO_VAULTS, HWUSD_META_MORPHO_VAULTS } = require('../constants');

/**
 * Process Meta Morpho vault positions
 */
async function processVaults(api, vaults, chain) {
    
    const [supplies, rates] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: vaults.map(v => ({ target: v.vault, params: [v.wallet] })),
            abi: 'erc20:balanceOf',
            chain: chain
        }),
        sdk.api.abi.multiCall({
            calls: vaults.map(v => ({ target: v.vault, params: [(10 ** v.decimals).toString()] })),
            abi: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
            chain: chain
        }),
    ]);

    supplies.output.forEach((data, i) => {
        const vault = data.input.target;
        const decimals = vaults[i].decimals;
        const decimalScaling = 10 ** decimals;
        const underlying = vaults[i].underlying;
        const amount = data.output;
        const rate = rates.output[i].output;
        const correctedAmount = (amount / decimalScaling) * (rate / decimalScaling) * decimalScaling;
        api.add(underlying, correctedAmount);
    });

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

async function hyperevmHwhypeMorphoTvl(api) {
    const vaults = [...HWHYPE_META_MORPHO_VAULTS];
    return processVaults(api, vaults, 'hyperliquid');
}

async function hyperevmHwusdMorphoTvl(api) {
    const vaults = [...HWUSD_META_MORPHO_VAULTS].filter(v => v.chain === 'hyperliquid');
    return processVaults(api, vaults, 'hyperliquid');
}

async function mainnetHwusdMorphoTvl(api) {
    const vaults = [...HWUSD_META_MORPHO_VAULTS].filter(v => v.chain === 'ethereum');
    return processVaults(api, vaults, 'ethereum');
}

async function baseHwusdMorphoTvl(api) {
    const vaults = [...HWUSD_META_MORPHO_VAULTS].filter(v => v.chain === 'base');
    return processVaults(api, vaults, 'base');
}


module.exports = {
    hyperevmHwhypeMorphoTvl,
    hyperevmHwusdMorphoTvl,
    mainnetHwusdMorphoTvl,
    baseHwusdMorphoTvl
};