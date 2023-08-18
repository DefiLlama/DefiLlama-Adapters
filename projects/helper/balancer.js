const { sumTokens2 } = require('./unwrapLPs');
const { getLogs } = require('./cache/getLogs')

function onChainTvl(vault, fromBlock, { blacklistedTokens = [], preLogTokens = [], onlyUseExistingCache } = {}) {
  return async (_, _1, _2, { api }) => {
    const logs = await getLogs({
      api,
      target: vault,
      topics: ['0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e'],
      fromBlock,
      eventAbi: 'event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)',
      onlyArgs: true,
      extraKey: 'PoolRegistered',
      onlyUseExistingCache,
    })
    const logs2 = await getLogs({
      api,
      target: vault,
      topics: ['0xf5847d3f2197b16cdcd2098ec95d0905cd1abdaf415f07bb7cef2bba8ac5dec4'],
      fromBlock,
      eventAbi: 'event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)',
      onlyArgs: true,
      extraKey: 'TokensRegistered',
      onlyUseExistingCache,
    })

    const tokens = logs2.map(i => i.tokens).flat()
    tokens.push(...preLogTokens)
    const pools = logs.map(i => i.poolAddress)
    blacklistedTokens = [...blacklistedTokens, ...pools]

    return sumTokens2({ api, owner: vault, tokens, blacklistedTokens, })
  }
}

function v1Tvl(bPoolFactory, fromBlock, { blacklistedTokens = [] } = {}) {
  return async (_, _1, _2, { api }) => {
    let poolLogs = await getLogs({
      target: bPoolFactory,
      topic: 'LOG_NEW_POOL(address,address)',
      fromBlock,
      api,
      eventAbi: 'event LOG_NEW_POOL (address indexed caller, address indexed pool)',
      onlyArgs: true,
    })

    const pools = poolLogs.map(i => i.pool)
    const tokens = await api.multiCall({ abi: "address[]:getCurrentTokens", calls: pools })
    const ownerTokens = tokens.map((v, i) => [v, pools[i]])
    return sumTokens2({ api, ownerTokens, blacklistedTokens: [...blacklistedTokens, ...pools,] })
  }
}

module.exports = {
  onChainTvl,
  v1Tvl,
};
