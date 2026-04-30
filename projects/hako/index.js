const { toUSDTBalances } = require('../helper/balances')
const BigNumber = require('bignumber.js')

const HAKO_STABLE_VAULT = '0xda6600Dd3124f07EC82304b059248e5b529864df'
const NORMALIZED_DECIMALS = 18

async function tvl(api) {
  const totalAssets = await api.call({
    target: HAKO_STABLE_VAULT,
    abi: 'uint256:totalAssets',
  })

  const vaultTVL = BigNumber(totalAssets.toString())
    .div(BigNumber(10).pow(NORMALIZED_DECIMALS))
    .toFixed(0)

  return toUSDTBalances(vaultTVL)
}

module.exports = {
  start: 1771681367,
  methodology: "We calculate TVL based on the total managed assets (in USD) of our home proxy contract on Base, accounting for all assets and LP tokens",
  base: {
    tvl,
  },
}
