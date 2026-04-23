const { sumERC4626VaultsExport } = require('../helper/erc4626');

// Quell RWAVault on Arbitrum One (ERC-4626, USDC in / rvUSDC out).
// Yield routes into Spark sUSDC via the protocol's IYieldAdapter.
const RWA_VAULT_ARBITRUM = '0x82bDeB9239d33AAE4b8c38C0C0ef3B088b0Fc791';

module.exports = {
  methodology:
    'TVL is totalAssets() of the Quell RWAVault (ERC-4626) on Arbitrum One. ' +
    'Underlying asset is native USDC (0xaf88...5831). Yield route: Spark sUSDC.',
  arbitrum: {
    tvl: sumERC4626VaultsExport({
      vaults: [RWA_VAULT_ARBITRUM],
      tokenAbi: 'asset',
      balanceAbi: 'totalAssets',
    }),
  },
};
