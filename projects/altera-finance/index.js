const { sumTokens2 } = require('../helper/unwrapLPs')

const POOLINFO = '0x744EaA81544E940F054AC1931025f1B6D26f2FDE'
const PM = '0x1dc0d79dab5a4a630d2af3f9dc973af97f390427'

async function tvl(api) {
  const pools = await api.call({
    target: POOLINFO,
    abi: 'function getAllPoolsTVL() view returns ((address token, uint8 decimals, uint256 amount)[])',
  })
  const tokens = pools.map(p => p.token)
  return sumTokens2({ api, tokens, owner: PM, resolveUniV3: true })
}

module.exports = {
  start: 1776849595,
  ethereum: { tvl },
}
