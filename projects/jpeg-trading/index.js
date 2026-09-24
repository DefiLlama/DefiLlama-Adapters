const { getCuratorExport } = require('../helper/curators')

// Euler's maintained product labels associate these EVK vaults with JPEG Trading:
// https://github.com/euler-xyz/euler-labels/blob/master/1/products.json
// https://github.com/euler-xyz/euler-labels/blob/master/8453/products.json
const evk = {
  ethereum: [
    '0x0120c2748545a4D9C875CDdFB439f786d6f1B460', // tGLD, JPEG Trading x Tenbin RWAs
    '0xb57320b253363bf749D5CE6e66592FDC74cce6f7', // USDC, JPEG Trading x Tenbin RWAs
  ],
  base: [
    '0xcc639251bd612A0930990162c15227D1Ba996354', // USDC, YuTy
  ],
}

const earn = '0x018b86A893F57a632F90c4A8308353Ac938adc01' // JPEG Trading x Tenbin RWAs
const nestedUsdcVault = evk.ethereum[1]
const underlyingUsdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const curator = getCuratorExport({
  methodology: 'Counts the underlying assets supplied to JPEG Trading Euler EVK vaults on Ethereum and Base, plus Euler Earn assets outside its own USDC EVK vault. The Earn-to-EVK position is subtracted to avoid counting the same deposit twice. These Euler deposits overlap Euler V2 TVL.',
  blockchains: {
    ethereum: { euler: evk.ethereum },
    base: { euler: evk.base },
  },
})

const ethereumEvkTvl = curator.ethereum.tvl

module.exports = curator

module.exports.ethereum = {
  tvl: async (api) => {
    await ethereumEvkTvl(api)

    // Earn currently invests in its own USDC EVK vault and another Euler market.
    // Keep the uncounted assets of the Earn vault while excluding its own EVK shares.
    const [earnAssets, sharesInOwnVault] = await Promise.all([
      api.call({ target: earn, abi: 'uint256:totalAssets' }),
      api.call({ target: nestedUsdcVault, abi: 'function balanceOf(address) view returns (uint256)', params: [earn] }),
    ])
    const ownVaultAssets = await api.call({
      target: nestedUsdcVault,
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      params: [sharesInOwnVault],
    })
    const remainder = BigInt(earnAssets) - BigInt(ownVaultAssets)
    if (remainder > 0n) api.add(underlyingUsdc, remainder.toString())
  },
}
