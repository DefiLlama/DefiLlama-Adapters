const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONTRACT = '0xca38607d85e8f6294dc10728669605e6664c2d70'
const USDC = ADDRESSES.base.USDC
const chain = 'base'

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({
    api,
    tokens: [USDC],
    owners: [CONTRACT],
    chain,
  })
}

module.exports = {
  timetravel: false,
  start: 1705770337, // Jan-20-2025 06:05:37 PM +UTC 
  base: { tvl },
}
