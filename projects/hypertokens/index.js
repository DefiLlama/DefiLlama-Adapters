const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

// Ensemble ERC-4626 vaults on HyperEVM (chain key: hyperliquid).
// Underlying asset for both is HyperEVM USDC (0xb88339cb7199b77e23db6e890353e22632ba630f).
const VAULTS = [
  '0x59A72A4b8D632005112f7D2bc0D035E06bE043D9', // iVOL
  '0xEb22eC1b402dcc4155B9D8d2E1db2f2d229162CC', // VOL
]

module.exports = {
  methodology:
    'TVL is the sum of ERC-4626 totalAssets() across the Ensemble iVOL and VOL vaults on HyperEVM, counted in their underlying USDC. Hyper Tokens (hypertokens.io) is the non-custodial front end for trading these ~6x leveraged BTC exposure tokens.',
  hyperliquid: {
    tvl: sumERC4626VaultsExport2({ vaults: VAULTS }),
  },
}
