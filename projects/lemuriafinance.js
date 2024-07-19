
const { getConfig } = require('./helper/cache')
const { sumUnknownTokens } = require('./helper/unknownTokens')

async function tvl(api) {
  let data = await getConfig('lemuria', 'https://raw.githubusercontent.com/lemuriafinance/lemuria-frontend-pub/main/src/features/configure/vault/milkomeda_pools.js')
  data = JSON.parse(data.slice(data.indexOf('[')).replaceAll('\'', '"').replaceAll(/\n\s+(\w+)/g, '"$1"').split('\n').map(i => i.replaceAll(/\s+\/\/.*/g, '').trim()).join('').replaceAll(';', '').replaceAll(/,(\]|\})/g, '$1'))
  const pools = data.map(i => i.earnContractAddress)
  const tokens = await api.multiCall({  abi: 'address:want', calls: pools})
  const bals = await api.multiCall({  abi: 'uint256:balance', calls: pools})
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL data is pulled from the Lemuria Financial API "https://api.lemuria.finance/tvl".',
  milkomeda: {
    tvl
  },
};
