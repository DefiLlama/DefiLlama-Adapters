const { sumTokens2, } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_timestamp, block, _1, { api }) {
  const owners = []
  const tokens = []
  for (const group of tokenHolderMap) {
    let holders = await getLogs({
      ...group.logConfig,
      api,
    }).then(logs => logs.map((poolLog) => `0x${poolLog.data.substr(26, 40)}`))
    if (group.abi === 'address:LPtoken')
      holders = holders.filter(i => i .toLowerCase() !==  '0xac6f575fda9b5009993f783845dac63c079f3de7')
    const _tokens = await api.multiCall({ abi: group.abi, calls: holders, })
    owners.push(...holders)
    tokens.push(..._tokens)
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
    abi: "address:LPtoken",
  },
  {
    logConfig: {
      target: "0x6C74E2A1074ABe18969Be37210B93e681A40b35A",
      topic: "NewSCVault(address,address)",
      fromBlock: 11803584,
    },
    abi: "address:stablecoin",
  },
  {
    logConfig: {
      target: "0x8E0Fa7c5C7Fa86A059e865A90b50a90351df716a",
      topic: "NewLPVault(address)",
      fromBlock: 11654924,
    },
    abi: "address:LPtoken",
  },
  {
    logConfig: {
      target: "0x8E0Fa7c5C7Fa86A059e865A90b50a90351df716a",
      topic: "NewSCVault(address,address)",
      fromBlock: 11654924,
    },
    abi: "address:LPtoken",
  },
]
