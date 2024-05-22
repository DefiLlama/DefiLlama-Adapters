// sumToken2 will be from the massa helper 
const { sumTokens, fetchList, multiCall, api } = require('../helper/chain/massa.js')

const factoryAddress = {
  massa: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX',
}

async function tvl(api) {

  const pools = fetchList(factoryAddress.massa); 
  console.log(pools)

  // const tokenA = await api.multiCall({
  //   abi: 'address:tokenX',
  //   calls: pools,
  // })
  // const tokenB = await api.multiCall({
  //   abi: 'address:tokenY',
  //   calls: pools,
  // })
  // const toa = []
  // tokenA.map((_, i) => {
  //   toa.push([tokenA[i], pools[i]])
  //   toa.push([tokenB[i], pools[i]])
  // })
  // return sumTokens({ api, tokensAndOwners: toa })
  return pools
}

// test the tvl 
tvl(api).then(console.log)



module.exports = {
  methodology: 'counts the token balances in different liquidity book contracts',
  start: 1713170000,
  massa: {
    tvl,
  }
}; 