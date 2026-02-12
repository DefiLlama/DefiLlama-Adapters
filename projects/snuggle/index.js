const { sumTokens2 } = require('../helper/unwrapLPs')

// Snuggle Vault on Base - holds Uniswap V3 NFT positions
const SNUGGLE_VAULT = '0x43Ca8D329d91ADF0aa471aC7587Aac1B2743F043'

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [SNUGGLE_VAULT],
    resolveUniV3: true,
  })
}

module.exports = {
  methodology: 'TVL is calculated by summing the value of all Uniswap V3 concentrated liquidity positions held by the Snuggle vault contract.',
  start: 1704067200, // January 1, 2024 (approximate launch)
  doublecounted: true,
  base: {
    tvl,
  },
}
