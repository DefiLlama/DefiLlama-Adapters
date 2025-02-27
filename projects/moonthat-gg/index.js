const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0x966983F93309D726a888adff08331ac81b522971', fromBlock: 20815952 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event CommunityLaunchCreated (address indexed singleton, bytes32 indexed coinId, address indexed proxy)', fromBlock, })
      const proxies = logs.map(log => log.proxy)
      await api.sumTokens({ tokens: [ADDRESSES.null], owners: proxies }) // add ETH deposited to initial pool
      const tokens = await api.multiCall({ abi: 'address:tokenAddress', calls: proxies })
      const utilities = await api.multiCall({ abi: 'address:MOONTHAT_UNISWAP_V3_UTILITY', calls: proxies })
      const vaults = await api.multiCall({ abi: 'address:moonThatUniswapV3Vault', calls: utilities })
      return sumTokens2({ api, owners: vaults, resolveUniV3: true, blacklistedTokens: tokens })
    }
  }
})