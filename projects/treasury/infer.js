const { treasuryExports } = require('../helper/treasury')
const sdk = require('@defillama/sdk')

const TREASURY = '0x6Ac8fF96Fb8DCF5d79A8eF1E59D9AC23f2BD27Bc' // imdUSD Treasury
const SIMD = '0x9Efa934D9fAd4AE28c998a40195646b965a97247' // StakedIMD (sIMD), 24 decimals
const IMD = '0xD34a99Bc0f67aE1bbd63C660e6d0b0dd03E263B7'
const INFER = '0x53d0eA0A685220718Dc6a0a6e4617194C6F37921'
const IMDUSD = '0x61aAF8a992A3143e2B0C9cB0030b9fE702854a25'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const base = treasuryExports({
  ethereum: {
    owners: [TREASURY],
    tokens: [IMD, USDC],
    ownTokens: [INFER, IMDUSD],
    fetchCoValentTokens: false,
  },
})

// The Treasury's sIMD (its redemption reserve), counted as the IMD it converts to: 24-decimal shares, not 1:1.
async function simd(api) {
  const shares = await api.call({ target: SIMD, abi: 'erc20:balanceOf', params: [TREASURY] })
  const imd = await api.call({ target: SIMD, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [shares] })
  api.add(IMD, imd)
  return api.getBalances()
}

module.exports = {
  ...base,
  ethereum: { ...base.ethereum, tvl: sdk.util.sumChainTvls([base.ethereum.tvl, simd]) },
}
