const ADDRESSES = require('../helper/coreAssets.json')
const pools_provider = "0xE4534d76Cc512a14F288453F06F8961740Ae2a1E"

async function tvl(api) {
  let data = await api.fetchList({  lengthAbi: 'poolLength', itemAbi: 'function poolList(uint256) view returns (uint256 maxAmount, address strategy, address asset, uint64 payoutFrequency, uint32 totalPayments, uint32 rateIndex)', target: pools_provider})
  data = data.filter(i => i.strategy !== ADDRESSES.null)
  const aTokens = await api.multiCall({  abi: 'address:aToken', calls: data.map(i => i.strategy)})
  const ownerTokens = data.map((i, idx) => [[i.asset, aTokens[idx]], i.strategy])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  arbitrum: {
    tvl,
  }
}
