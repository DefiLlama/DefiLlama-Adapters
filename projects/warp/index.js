const { sumTokens2, } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const owners = []
  const tokens = []
  for (const group of tokenHolderMap) {
    let holders = await getLogs({
      ...group.logConfig,
      api,
    }).then(logs => logs.map((poolLog) => `0x${poolLog.data.substr(26, 40)}`))
    const _tokens = await api.multiCall({ abi: 'address:LPtoken', calls: holders, permitFailure: true, })
    const failedHolders = holders.filter((holder, i) => {
      if (_tokens[i]) {
        owners.push(holder)
        tokens.push(_tokens[i])
        return false
      }
      return true
    })

    const _tokens2 = await api.multiCall({ abi: 'address:stablecoin', calls: failedHolders })
    owners.push(...failedHolders)
    tokens.push(..._tokens2)
  }
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], })
}

module.exports = {
  start: 1610650220,
  ethereum: { tvl },
}

const tokenHolderMap = [
  {
    logConfig: {
      target: "0x6C74E2A1074ABe18969Be37210B93e681A40b35A",
      topic: "NewLPVault(address)",
      fromBlock: 11803584,
    },
  },
  {
    logConfig: {
      target: "0x6C74E2A1074ABe18969Be37210B93e681A40b35A",
      topic: "NewSCVault(address,address)",
      fromBlock: 11803584,
    },
  },
  {
    logConfig: {
      target: "0x8E0Fa7c5C7Fa86A059e865A90b50a90351df716a",
      topic: "NewLPVault(address)",
      fromBlock: 11654924,
    },
  },
  {
    logConfig: {
      target: "0x8E0Fa7c5C7Fa86A059e865A90b50a90351df716a",
      topic: "NewSCVault(address,address)",
      fromBlock: 11654924,
    },
  },
]
