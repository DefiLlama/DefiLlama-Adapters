const ADDRESSES = require('../helper/coreAssets.json')
const pools_providers = ["0xE4534d76Cc512a14F288453F06F8961740Ae2a1E", '0x993e06adeb3050a1Df385E05a2deb4b15a0DBCBF']

async function tvl(api) {
  let data = []
  for(const pools_provider of pools_providers){
    const _data = await api.fetchList({  lengthAbi: 'poolLength', itemAbi: 'function poolList(uint256) view returns (uint256 maxAmount, address strategy, address asset, uint64 payoutFrequency, uint32 totalPayments, uint32 rateIndex)', target: pools_provider})
    data = data.concat(_data)
  }
  data = data.filter(i => i.strategy !== ADDRESSES.null)
  const aTokens = await api.multiCall({  abi: 'address:aToken', calls: data.map(i => i.strategy)})
  const ownerTokens = data.map((i, idx) => [[i.asset, aTokens[idx]], i.strategy])
  return api.sumTokens({ ownerTokens, blacklistedTokens: ['0x42c248d137512907048021b30d9da17f48b5b7b2'] })
}

module.exports = {
  arbitrum: {
    tvl,
  }
}
