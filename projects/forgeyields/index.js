const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json');


async function fetcher() {
  const apiUrl = 'https://api.forgeyields.com/strategies'
  return get(apiUrl)
}

async function tvl(api) {
  const strategies = await getConfig('forgeyields', undefined, { fetcher })
  for (let index = 0; index < strategies.length; index++) {
    const strategyInfo = strategies[index];
    console.log(strategyInfo.tvl)
    const underlying = ADDRESSES.starknet[strategyInfo.underlyingSymbol]
    api.add(underlying, strategyInfo.tvl * 10 ** strategyInfo.decimals)
  }
}
module.exports = {
  methodology: 'Compute the total assets under management for each strategy.',
  starknet: {
    tvl
  },
}
