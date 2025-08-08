const { sumTokens2 } = require('../helper/unwrapLPs')

const CONTRACT = '0xca38607d85e8f6294dc10728669605e6664c2d70'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
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
