const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const ADDRESSES = require('./coreAssets.json')

const USDM = '0xe2d2959f89b6389deb624bf076fe7d9e5401f377'
const mxHYPE = '0x0fafad2825aa646fdf343a0786d0dc1a842543b6'
const stakingTokens = [
  ['0x5f1ab62c3159ebe04aff14beef84b0b60de63ddf', USDM], // sUSDM: 12-decimal shares, 6-decimal assets
  ['0xf6b61a1d49b67ac907d825f26e2877f1ec4f0ae8', mxHYPE], // smxHYPE: 24-decimal shares, 18-decimal assets
]

// Replace only the receipts held by the pools, not the total backing of Monetrix.
// USDM and mxHYPE have 1:1 standard redemption in USDC and native HYPE respectively.
function withMonetrixBalances(tvl) {
  return async (api) => {
    const balances = await tvl(api)
    for (const [token, asset] of stakingTokens) {
      const key = `${api.chain}:${token}`
      if (!balances[key] || BigNumber(balances[key]).isZero()) continue
      const assets = await api.call({
        target: token,
        abi: 'function convertToAssets(uint256) view returns (uint256)',
        params: [BigNumber(balances[key]).toFixed(0)],
      })
      delete balances[key]
      sdk.util.sumSingleBalance(balances, `${api.chain}:${asset}`, assets)
    }

    for (const [token, asset] of [[USDM, ADDRESSES.hyperliquid.USDC], [mxHYPE, ADDRESSES.hyperliquid.WHYPE]]) {
      const key = `${api.chain}:${token}`
      if (balances[key] === undefined) continue
      const balance = balances[key]
      delete balances[key]
      sdk.util.sumSingleBalance(balances, `${api.chain}:${asset}`, balance)
    }
    return balances
  }
}

module.exports = { withMonetrixBalances }
