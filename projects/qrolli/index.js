const ADDRESSES = require("../helper/coreAssets.json")
const BitsHub = "0x64af2e5b1f6c0194adc5a0f17bc566a6d30f21e1"

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'getBitsLength', itemAbi: 'bitsClones', target: BitsHub })
  api.sumTokens({ owners: pools, tokens: [ADDRESSES.null] }) // For MATIC amount
  return api.sumTokens({ owners: pools, tokens: [ADDRESSES.null] }) // For Token amount which is same as MATIC amount
}

module.exports = {
  polygon: { tvl },
}