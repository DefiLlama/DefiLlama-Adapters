const { getLogs } = require('../helper/cache/getLogs')
const abi = require("../helper/abis/morpho.json");
const { morphoBlue, whitelistedIds } = require("./addresses");

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  doublecounted: true,
};

const config = {
  ethereum: { morphoBlue, fromBlock: 18883124 }
}

Object.keys(config).forEach(chain => {
  const { morphoBlue, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const marketIds = await getMarkets(api)
      const tokens = (await api.multiCall({ target: morphoBlue, calls: marketIds, abi: abi.morphoBlueFunctions.idToMarketParams })).map(i => [i.collateralToken, i.loanToken]).flat()
      return api.sumTokens({ owner: morphoBlue, tokens })
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const marketIds = await getMarkets(api)
      const marketInfo = await api.multiCall({ target: morphoBlue, calls: marketIds, abi: abi.morphoBlueFunctions.idToMarketParams })
      const marketData = await api.multiCall({ target: morphoBlue, calls: marketIds, abi: abi.morphoBlueFunctions.market })
      marketData.forEach((i, idx) => {
        api.add(marketInfo[idx].loanToken, i.totalBorrowAssets)
      })
      return api.getBalances()
    },
  }

  async function getMarkets(api) {
    const logs = await getLogs({
      api, target: morphoBlue,
      eventAbi: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)',
      onlyArgs: true, fromBlock,
    })
    return logs.map(i => i.id).concat(whitelistedIds)
  }
})