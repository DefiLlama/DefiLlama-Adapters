const { dataSearch } = require('./helper/chain/waves');
const { getConfig } = require("./helper/cache");
const { transformDexBalances, } = require("./helper/portedTokens");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  waves: {
    tvl,
  }
}

async function tvl(api) {
  const data = []
  const pools = await getConfig('puzzle-dex', 'https://puzzle-js-back.herokuapp.com/api/v1/pools')
  for (const { contractAddress } of pools) {
    const res = await dataSearch(contractAddress, "global_.*_balance")
    let items = []
    res.forEach(({ key, value }) => {
      const token = key.replace('global_', '').replace('_balance', '')
      items.push({ token, value })
    })

    if (res.length !== 2)
      items.forEach(({ token, value }) => api.add(token, value))
    else
      data.push({
        token0: items[0].token,
        token1: items[1].token,
        token0Bal: items[0].value,
        token1Bal: items[1].value,
      })
  }
  return transformDexBalances({ api, data, })
}