const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const owner = await api.call({  abi: 'address:owner', target: '0x900cb2ed071cc54fb2093d930c8821f9e5338a0c'})
  return api.sumTokens({ owner, tokens: [ADDRESSES.null]})
}

module.exports = {
  ethereum: {
    tvl,
  },
}