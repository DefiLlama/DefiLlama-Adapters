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
  hallmarks : [
    [1691373600, "Steadefi exploited"],
  ],
};
/* 
Object.keys(config).forEach(chain => {
  const { fsglp } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const chainId = api.getChainId()
      let [lendingPools, vaults] = await getProjectInfo()
      lendingPools = lendingPools.filter(i => i.chainId === chainId).map(i => i.address)
      const grailVaults = vaults.filter(i => i.chainId === chainId && i.protocol === 'Camelot').map(i => i.address)
      vaults = vaults.filter(i => i.chainId === chainId && i.protocol !== 'Camelot').map(i => i.address)
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
      if (grailVaults.length) {
        const grailManagers = await api.multiCall({ abi: 'address:manager', calls: grailVaults })
        const spNfts = await api.multiCall({ abi: 'address:spNft', calls: grailManagers })
        const positionIds = await api.multiCall({ abi: 'uint256:positionId', calls: grailManagers })
        const poolInfos = await api.multiCall({ abi: camelotNFTPoolAbi.getPoolInfo, calls: spNfts })
        const stakedPositionInfo = await api.multiCall({ abi: camelotNFTPoolAbi.getStakingPosition, calls: spNfts.map((v, i) => ({ target: v, params: positionIds[i] })) })
        const lpTokens = poolInfos.map(v => v.lpToken)
        const lpBalances = stakedPositionInfo.map(v => v.amount)
        api.addTokens(lpTokens, lpBalances)
      }
      return sumTokens2({ api, tokensAndOwners2: [lpAssets, lendingPools] })
    }
  }
}) */

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const chainId = api.getChainId()
      let [lendingPools, vaults] = await getProjectInfo()
      lendingPools = lendingPools.filter(i => i.chainId === chainId).map(i => i.address)
      vaults = vaults.filter(i => i.chainId === chainId)
      const vaultAddresses = vaults.map(i => i.address)
      const lpAssets = await api.multiCall({ abi: 'address:asset', calls: lendingPools })
      const bals = await api.multiCall({ abi: 'function assetAmt() view returns (uint256,uint256)', calls: vaultAddresses })
      bals.forEach(([bal0, bal1], i) => {
        api.addToken(vaults[i].tokens[0].address, bal0)
        api.addToken(vaults[i].tokens[1].address, bal1)
      })
      return sumTokens2({ api, tokensAndOwners2: [lpAssets, lendingPools] })
    }
  }
})