const ADDRESSES = require('../helper/coreAssets.json')

const UTY_VAULT = '0xBA515304d8153c4b162dC79f867E152DF9c127eb'

async function tvl(api) {
  const totalAssets = await api.call({
    abi: 'uint256:totalAssets',
    target: UTY_VAULT,
  })

  api.add(ADDRESSES.base.USDC, totalAssets)
}

module.exports = {
  base: { tvl },
}
