const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { HWHYPE_META_MORPHO_VAULTS, HWUSD_META_MORPHO_VAULTS } = require('../constants');

/**
 * Process Meta Morpho vault positions
 */
async function processVaults(api, vaults) {

    const [supplies, rates] = await Promise.all([
        api.multiCall({
            calls: vaults.map(v => ({ target: v.vault, params: [v.wallet] })),
            abi: 'erc20:balanceOf',
        }),
        api.multiCall({
            calls: vaults.map(v => ({ target: v.vault, params: [(10 ** v.decimals).toString()] })),
            abi: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
        }),
    ]);

    supplies.forEach((amount, i) => {
        const decimals = vaults[i].decimals;
        const decimalScaling = 10 ** decimals;
        const underlying = vaults[i].underlying;
        const rate = rates[i];
        const correctedAmount = (amount / decimalScaling) * (rate / decimalScaling) * decimalScaling;
        api.add(underlying, correctedAmount);
    });

    return sumUnknownTokens({ api, useDefaultCoreAssets: true });
}

async function hyperevmHwhypeMorphoTvl(api) {
    const vaults = [...HWHYPE_META_MORPHO_VAULTS];
    return processVaults(api, vaults);
}

async function hyperevmHwusdMorphoTvl(api) {
    const vaults = [...HWUSD_META_MORPHO_VAULTS].filter(v => v.chain === 'hyperliquid');
    return processVaults(api, vaults);
}

async function mainnetHwusdMorphoTvl(api) {
    const vaults = [...HWUSD_META_MORPHO_VAULTS].filter(v => v.chain === 'ethereum');
    return processVaults(api, vaults);
}

async function baseHwusdMorphoTvl(api) {
    const vaults = [...HWUSD_META_MORPHO_VAULTS].filter(v => v.chain === 'base');
    return processVaults(api, vaults);
}


module.exports = {
    hyperevmHwhypeMorphoTvl,
    hyperevmHwusdMorphoTvl,
    mainnetHwusdMorphoTvl,
    baseHwusdMorphoTvl
};