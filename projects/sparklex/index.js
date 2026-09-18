const { sumTokens2 } = require('../helper/unwrapLPs')

const ethereumEarnVaults = [
  '0xef8629D568AdCa04D0aC52C7388d5377872d7F61',
  '0xBD35B9C345fC95ae2952Ad257A6c60f2861Be5F1',
]
const earnVaults = {};
earnVaults['ethereum'] = ethereumEarnVaults;

async function tvl(api) {  
  if (api.chain === 'ethereum'){
    let _vaults = earnVaults[api.chain];
    
    // query totalAssets from earn vaults
    const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: _vaults })
    const calls = []
    const filteredBals = bals.filter((bal, i) => {
       const hasBal = +bal > 0
       if (hasBal) calls.push(_vaults[i])
       return hasBal
    })
  
    // fetch asset token for each earn vault
    const tokensAsset = await api.multiCall({ abi: 'address:asset', calls, permitFailure: true })
    filteredBals.forEach((bal, i) => {
       const token = tokensAsset[i]
       if (token) api.add(token, bal)
    })
      
  }
  
  return sumTokens2({ api, resolveLP: true })
}

module.exports = {
  doublecounted: true,
  hallmarks: [
    ["2025-07-24", "SparkleX Official Launch"],
  ]
}

const chains = ['ethereum', 'base', 'bsc']

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})