const ADDRESSES = require('../helper/coreAssets.json')
const VaultManager = "0xe9fB8C70aF1b99F2Baaa07Aa926FCf3d237348DD"

async function tvl(_, _1, { base: block }, { api }) {
    const vaultManagerBalance = await api.call({
        target: VaultManager,
        abi: 'function currentBalanceUSDC() view returns (uint256)',
        block
    });

    api.add(ADDRESSES.base.USDC, vaultManagerBalance)

    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.base.USDC,
        params: [VaultManager],
        block
    });

    api.add(ADDRESSES.base.USDC, collateralBalance)
}


module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of USDC tokens in the Avantis contract.',
    base: {
        tvl
    }
}; 