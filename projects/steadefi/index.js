const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { camelotNFTPoolAbi } = require('../single/abi');

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
  hallmarks: [
    [1691373600, "Steadefi exploited"],
  ],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const chainId = api.getChainId()
      let [lendingPools, vaults] = await getProjectInfo()
      lendingPools = lendingPools.filter(i => i.chainId === chainId).map(i => i.address)
      vaults = vaults.filter(i => i.chainId === chainId)
      const vaultAddresses = vaults.map(i => i.address)
      const lpAssets = await api.multiCall({ abi: 'address:asset', calls: lendingPools })
      const bals = await api.multiCall({ abi: 'function assetAmt() view returns (uint256,uint256)', calls: vaultAddresses, permitFailure: true })
      bals.forEach((res, i) => {
        if (!res) return;
        const [bal0, bal1] = res
        api.addToken(vaults[i].tokens[0].address, bal0)
        api.addToken(vaults[i].tokens[1].address, bal1)
      })
      return sumTokens2({ api, tokensAndOwners2: [lpAssets, lendingPools] })
    }
  }
})