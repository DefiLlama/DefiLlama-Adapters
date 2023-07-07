const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function getProjectInfo() {
  return Promise.all([
    getConfig('steadefi/lendingPools', 'https://api.steadefi.com/lending-pools'),
    getConfig('steadefi/vaults', 'https://api.steadefi.com/vaults'),
  ])
}

const config = {
  arbitrum: { fsglp: ADDRESSES.arbitrum.fsGLP },
  avax: { fsglp: '0x9e295B5B976a184B14aD8cd72413aD846C299660' },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { fsglp } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const chainId = api.getChainId()
      let [lendingPools, vaults] = await getProjectInfo()
      lendingPools = lendingPools.filter(i => i.chainId === chainId).map(i => i.address)
      vaults = vaults.filter(i => i.chainId === chainId).map(i => i.address)
      const lpAssets = await api.multiCall({ abi: 'address:asset', calls: lendingPools })
      const managers = await api.multiCall({ abi: 'address:manager', calls: vaults })
      let lpTokens = await api.multiCall({ abi: 'address:lpToken', calls: managers, permitFailure: true, })
      const glpPoolManagers = managers.filter((_, i) => !lpTokens[i])
      glpPoolManagers.forEach(v => {
        lpAssets.push(fsglp)
        lendingPools.push(v)
      })
      const lpPoolManagers = managers.filter((_, i) => lpTokens[i])
      lpTokens = lpTokens.filter(i => i)
      const bals = await api.multiCall({ abi: 'uint256:lpTokenAmt', calls: lpPoolManagers })
      api.addTokens(lpTokens, bals)
      // api.add('tether', tokenValue.reduce((a, v) => a + v/1e13, 0), { skipChain: true})
      return sumTokens2({ api, tokensAndOwners2: [lpAssets, lendingPools] })
    }
  }
})