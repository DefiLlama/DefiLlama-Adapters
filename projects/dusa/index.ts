const { sumTokens2 } = require('../helper/unwrapLPs')

const factorie = {
  massa: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX',
}
async function tvl(api) {
//   const pools = await api.fetchList({
//     target: factories[api.chain],
//     itemAbi: 'function getAllLBPairs() view returns (address)',
//     lengthAbi: 'u64:getAllLBPairs',
//   })
   
  const pools = await api
  .getDatastoreEntries([
      {
        factorie,
          key: strToBytes('ALL_PAIRS')
      }
  ])
  .then((result) => result[0].final_value);
  
  const tokenA = await api.multiCall({
    abi: 'address:getTokenX',
    calls: pools,
  })
  const tokenB = await api.multiCall({
    abi: 'address:getTokenY',
    calls: pools,
  })
  const toa = []
  tokenA.map((_, i) => {
    toa.push([tokenA[i], pools[i]])
    toa.push([tokenB[i], pools[i]])
  })
  return sumTokens2({ api, tokensAndOwners: toa, blacklistedTokens: [] })
}

module.exports = {
  methodology: 'We count the token balances in in different liquidity book contracts',
}

Object.keys(factorie).forEach(chain => {
  module.exports[chain] = { tvl }
})

