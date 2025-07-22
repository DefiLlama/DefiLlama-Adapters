const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = require('./abi');

async function getBscTvl(api) {
  const poolAddress = "0x40E46dE174dfB776BB89E04dF1C47d8a66855EB3"
  const tokens = await api.call({
    target: poolAddress,
    abi: abi.getCurrentTokens,
  })
  return sumTokens2({ api, tokens, owner: poolAddress })
}

async function eth(api) {
  let poolLogs = await getLogs({
    target: '0x0Ba2e75FE1368d8d517BE1Db5C39ca50a1429441',
    topic: 'LOG_NEW_POOL(address,address)',
    fromBlock: 11362346,
    api,
  })

  poolLogs = poolLogs.concat(await getLogs({
    target: '0x967D77f1fBb5fD1846Ce156bAeD3AAf0B13020D1',
    topic: 'LOG_NEW_POOL(address,address,address)',
    fromBlock: 11706591,
    api,
  }))

  let pools = poolLogs.map((poolLog) => {
    return `0x${poolLog.topics[2].slice(26)}`
  });

  const tokensAndOwners = []
  const tokens = await api.multiCall({
    abi: abi.getCurrentTokens,
    calls: pools,
  })
  tokens.forEach((t, i) => {
    const owner = pools[i]
    tokensAndOwners.push(...t.map(j => ([j, owner])))
  })
  return sumTokens2({ api, tokensAndOwners, })

}

module.exports = {
  start: '2020-11-30', // 11/30/2021 @ 08:37am (UTC)
  bsc:{
    tvl: getBscTvl,
  },
  ethereum:{
    tvl: eth
  }
}
