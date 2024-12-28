const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const { data } = await getConfig('xei', 'https://app.xei.finance/indexer/1329/xei/poolList?page=1&pageSize=999')
  const transformToken = i => i === ADDRESSES.null ? ADDRESSES.sei.WSEI : i
  const ownerTokens = data.list.map(({ detail: i }) => ([[i.Token0, i.Token1].map(transformToken), i.Pool]))
  return sumTokens2({ api, ownerTokens, })
}

module.exports = {
  sei: { tvl },
}