const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = {
  "poolLength": "uint256:poolLength",
  "poolInfo": "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)",
  "getPoolId": "function getPoolId() view returns (bytes32)",
  "getPoolTokens": "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
  "getTokenInfo": "function getTokenInfo() view returns (address[] tokens, (uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)"
};
const { stripTokenHeader } = require('../helper/tokenMapping')

const config = {
  avax: { factory: '0x878fa1ef7d9c7453ea493c2424449d32f1dbd846', fromBlock: 10087927 },
}

const configBalancer = {
  polygon: { factory: '0x228885c9d0440Ae640B88fBeE31522CC6a59Fd2F', fromBlock: 42020509 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x2dcffae760adbb49d27552cdcd6cf9835c1a8e4545a5b123f8cac6d5a968b11b'],
        eventAbi: 'event LogNewPool(address indexed caller, address indexed pool)',
        onlyArgs: true,
        fromBlock,
      })
      const pools = logs.map(log => log.pool)
      const tokens = await api.multiCall({ abi: 'address[]:getCurrentTokens', calls: pools })
      await sumTokens2({ api, ownerTokens: pools.map((pool, i) => [tokens[i], pool]) })
      if (chain === 'avax') {
        const balances = api.getBalances()
        const allTokens = tokens.flat().map(i => i.toLowerCase()).filter(i => i !== '0xd0f41b1c9338eb9d374c83cc76b684ba3bb71557')
        const symbols = await api.multiCall({ abi: 'string:symbol', calls: allTokens, })
        const yrtTokens = allTokens.filter((token, i) => symbols[i] === 'YRT')
        const depositTokens = await api.multiCall({ abi: 'address:depositToken', calls: yrtTokens })
        const deposits = await api.multiCall({ abi: 'uint256:totalDeposits', calls: yrtTokens })
        const supply = await api.multiCall({ abi: 'uint256:totalSupply', calls: yrtTokens })
        Object.entries(balances).forEach(([token, balance]) => {
          const t = stripTokenHeader(token)
          yrtTokens.forEach((yToken, i) => {
            if (yToken === t) {
              delete balances[token]
              sdk.util.sumSingleBalance(balances, depositTokens[i], balance * deposits[i] / supply[i], api.chain)
            }
          })
        })
        return balances
      }
    }
  }
})

Object.keys(configBalancer).forEach(chain => {
  const { factory, fromBlock } = configBalancer[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const managedPoolFactory = await api.call({ target: factory, abi: 'address:managedPoolFactory' })
      const vault = await api.call({ target: managedPoolFactory, abi: 'address:getVault' })
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x3bccd8755c586fb977facb52bc850861b8588643edb28cbfef711671791710e9'],
        eventAbi: 'event KassandraPoolCreatedTokens (bytes32 indexed vaultPoolId, string tokenName, string tokenSymbol, address[] tokens)',
        onlyArgs: true,
        fromBlock,
      })
      const poolIds = logs.map(log => log.vaultPoolId)
      const data = await api.multiCall({ abi: abi.getPoolTokens, calls: poolIds, target: vault })
      data.forEach(({ tokens, balances }) => api.addTokens(tokens.slice(1), balances.slice(1)))
      return api.getBalances()
    }
  }
})