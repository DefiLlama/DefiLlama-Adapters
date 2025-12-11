const { getCache, setCache } = require('../helper/cache')
const { get } = require('../helper/http')
const { sliceIntoChunks, sleep } = require('../helper/utils')

module.exports = {
  misrepresentedTokens: true,
  isHeavyProtocol: true,
  timetravel: false,
  tron: {
    tvl: httpTvl,
  },
}

async function httpTvl(api) {
  const {data} = await get('https://abc.endjgfsv.link/swap/scan/liquidityall')
  const latest = data.pop()
  const timestamp = Date.now()  - 24 * 60 * 60 * 1000

  if (latest.time > timestamp) {
    api.addUSDValue(+latest.liquidity)
  } else {
    throw new Error("No recent data found")
  }
}

async function tvl(api) {
  const factories = [
    'TXk8rQSAvPvBBNtqSoY6nCfsXWCSSpTVQF',  // v1
    'TB2LM4iegvhPJGWn9qizeefkPMm7bqqaMs',  // v1.5
  ]
  let allPairs = []

  for (const factory of factories) {
    const { pairs = [] } = await getCache('sunswap', factory)
    const length = await api.call({ abi: 'uint256:tokenCount', target: factory, })
    const tokenCalls = []
    for (let i = pairs.length; i < length; i++) {
      tokenCalls.push(i)
    }

    if (tokenCalls.length) {
      const tokens = await api.multiCall({ abi: 'function getTokenWithId(uint256) view returns (address)', calls: tokenCalls, target: factory, })
      const newPairs = await api.multiCall({ abi: 'function getExchange(address) view returns (address)', calls: tokens, target: factory, })
      pairs.push(...newPairs)
      await setCache('sunswap', factory, { pairs })
    }
    
    allPairs = allPairs.concat(pairs)
  }

  const multicallContract = 'TEazPvZwDjDtFeJupyo7QunvnrnUjPH8ED'
  const chunks = sliceIntoChunks(allPairs, 500)

  const chunkCount = chunks.length
  console.log(`Processing ${chunkCount} chunks of calls to get TRX balance`)

  for (const calls of chunks) {
    const trxBalance = await api.multiCall({ abi: 'function getEthBalance(address) view returns (uint256)', calls, target: multicallContract, })
    api.addGasToken(trxBalance)
    api.addGasToken(trxBalance)  // adding twice to add token balance on the LP
    console.log(`Processed chunk ${chunks.indexOf(calls) + 1} of ${chunkCount}`)
    await sleep(4500)
  }
}