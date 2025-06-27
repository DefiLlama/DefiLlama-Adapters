const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

const collaterals = {
  'WETH': ADDRESSES.ethereum.WETH,
  'USDC': ADDRESSES.ethereum.USDC
}

async function tvl(api) {
  const assetsRaw = await getConfig('degenerative', 'https://raw.githubusercontent.com/yam-finance/synths-sdk/master/src/assets.json')
  const assets = Object.values(assetsRaw).map(b => Object.values(b)).flat().flat()
  return api.sumTokens({ tokensAndOwners: assets.map(a => [collaterals[a.collateral], a.emp.address]) })
}

module.exports = {
  doublecounted: true,  // same contracts are used in UMA
  ethereum: {
    tvl
  },
}
