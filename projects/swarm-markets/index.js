const { v1Tvl } = require("../helper/balancer")
const sdk = require('@defillama/sdk')

async function tvl(_, _b, _cb, { api, }) {
  const tvlFunc = v1Tvl('0x991fd11876a438af7bcadc98f4b3cf201bdf6191', 23158523)
  const balances_ = await tvlFunc(...arguments)
  const tokens = Object.keys(balances_)
  const uTokens = await api.multiCall({ abi: 'function xTokenToToken(address) view returns (address)', target: '0x6cdde4ed9165405c1914b229d3cd4ac9c354c331', calls: tokens.map(i => i.replace('polygon:', '')) })
  const balances = {}
  tokens.forEach((v, i) => {
    sdk.util.sumSingleBalance(balances, uTokens[i], balances_[v], api.chain)
  })
  return balances
}

module.exports = {
  polygon: {
    tvl
  }
}