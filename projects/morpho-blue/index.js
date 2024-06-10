const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  doublecounted: true,
};

const config = {
  ethereum: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    fromBlock: 18883124,
  },
  base: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    fromBlock: 13977148,
  },
};

Object.keys(config).forEach((chain) => {
  const { morphoBlue, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const marketIds = await getMarkets(api);
      const tokens = (
        await api.multiCall({
          target: morphoBlue,
          calls: marketIds,
          abi: abi.morphoBlueFunctions.idToMarketParams,
        })
      )
        .map((i) => [i.collateralToken, i.loanToken])
        .flat();
      return api.sumTokens({ owner: morphoBlue, tokens });
    },
    borrowed: async (api) => {
      const marketIds = await getMarkets(api);
      const marketInfo = await api.multiCall({
        target: morphoBlue,
        calls: marketIds,
        abi: abi.morphoBlueFunctions.idToMarketParams,
      });
      const marketData = await api.multiCall({
        target: morphoBlue,
        calls: marketIds,
        abi: abi.morphoBlueFunctions.market,
      });
      marketData.forEach((i, idx) => {
        api.add(marketInfo[idx].loanToken, i.totalBorrowAssets);
      });
      return api.getBalances();
    },
  };

  async function getMarkets(api) {
    const logs = await getLogs({
      api,
      target: morphoBlue,
      eventAbi:
        "event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)",
      onlyArgs: true,
      fromBlock,
      topics: [
        "0xac4b2400f169220b0c0afdde7a0b32e775ba727ea1cb30b35f935cdaab8683ac",
      ],
    });
    return logs.map((i) => i.id);
  }
});
