
const { getConfig } = require('../helper/cache')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function tvl(api) {
  let data = await getConfig('sleepearn', 'https://raw.githubusercontent.com/sleepearn/pools/main/kardia_pools.js')
  data = JSON.parse(data.slice(data.indexOf('[')).replaceAll('\'', '"').replaceAll(/\n\s+(\w+)/g, '"$1"').split('\n').map(i => i.replaceAll(/\s+\/\/.*/g, '').trim()).join('').replaceAll(';', '').replaceAll(/,(\]|\})/g, '$1'))
  const pools = data.map(i => i.earnContractAddress).filter(i => i.toLowerCase() !== '0x4EdB55Ab9aF276786468214c401c48751Da91e2a'.toLowerCase())
  const tokens = await api.multiCall({  abi: 'address:want', calls: pools})
  const bals = await api.multiCall({  abi: 'uint256:balance', calls: pools})
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  kardia: {
    tvl
  },
};
