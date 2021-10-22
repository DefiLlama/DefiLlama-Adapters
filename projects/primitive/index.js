const BigNumber = require('bignumber.js')
const v1TVL = require('./v1')

async function tvl(timestamp, block) {
  const [v1] = await Promise.all([v1TVL(timestamp, block)])

  const tokenAddresses = Object.keys(v1)
  const balances = Array.from(tokenAddresses).reduce(
    (accumulator, tokenAddress) => {
      const v1Balance = new BigNumber(v1[tokenAddress] || '0')
      accumulator[tokenAddress] = v1Balance.toFixed()
      return accumulator
    },
    {}
  )

  return balances
}

module.exports = {
  start: 1603954800, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  tvl, // tvl adapter
}
