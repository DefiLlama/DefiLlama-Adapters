const sdk = require('@defillama/sdk')
const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  tron: {
    morphoBlue: "TDH4dhmVQQNc1ZNudJwWzBcs2h6ahhWrpp",
    blackList: [],
    fromBlock: 81622428,
    blacklistedMarketIds: [
    ],
  },
}

const eventAbis = {
  createMarket: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)'
}

let marketsCache = null
const getMarket = async (api) => {
  if (!marketsCache) marketsCache = _getMarket(api)
  return marketsCache
}

const _getMarket = async (api) => {
  const { morphoBlue, fromBlock, blacklistedMarketIds = [], } = config[api.chain]

  let logs = await getLogs({ api, target: sdk.tron.hexifyTarget(morphoBlue), eventAbi: eventAbis.createMarket, fromBlock, onlyArgs: true, })

  api.block = null

  return logs.map((i) => i.id.toLowerCase()).filter((id) => !blacklistedMarketIds.includes(id))
}

const tvl = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]


  const markets = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams, })
  const tokens = marketInfos.flatMap(({ collateralToken, loanToken }) => [collateralToken, loanToken])

  return sumTokens2({ api, owner: morphoBlue, tokens, blacklistedTokens: blackList, permitFailure: true })
}

const borrowed = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]
  const markets = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const marketDatas = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.market })
  const blackListLower = blackList.map(b => b.toLowerCase())


  marketDatas.forEach((data, idx) => {
    const { collateralToken, loanToken } = marketInfos[idx];
    if (collateralToken.toLowerCase() === '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd') return;
    if (blackListLower.includes(loanToken.toLowerCase())) return;


    let amount = BigInt(data.totalBorrowAssets || 0)
    const supply = BigInt(data.totalSupplyAssets || 0)
    if (amount > supply) amount = supply
    api.add(loanToken, amount.toString());
  });
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed, }
})


module.exports.timetravel = false
