const sdk = require('@defillama/sdk');
const { sumUnknownTokens } = require('../../helper/unknownTokens');
const { META_MORPHO_VAULTS } = require('../constants');

/**
 * Process Meta Morpho vault positions
 */
async function processVaults(api) {
    const vaults = [...META_MORPHO_VAULTS];
    
    const [supplies, rates] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: vaults.map(v => ({ target: v.vault, params: [v.wallet] })),
            abi: 'erc20:balanceOf',
            chain: 'hyperliquid'
        }),
        sdk.api.abi.multiCall({
            calls: vaults.map(v => ({ target: v.vault, params: [(10 ** v.decimals).toString()] })),
            abi: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
            chain: 'hyperliquid'
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

module.exports = {
    processVaults,
};