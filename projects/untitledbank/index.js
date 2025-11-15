const { getLogs } = require("../helper/cache/getLogs");

const abi = {
    "idToMarketConfigs": "function idToMarketConfigs(uint256 id) returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)",
    "market": "function market(uint256 id) returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)"
}

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the UntitledHub contracts`,
  soneium: {
    tvl: async (api) => {
      const untitledHub = "0x2469362f63e9f593087EBbb5AC395CA607B5842F";
      const fromBlock = 1680171;
      
      const marketIds = await getMarkets(api, untitledHub, fromBlock);
      const tokens = (
        await api.multiCall({
          target: untitledHub,
          calls: marketIds,
          abi: abi.idToMarketConfigs,
        })
      )
        .map((i) => [i.collateralToken, i.loanToken])
        .flat();
      return api.sumTokens({ owner: untitledHub, tokens });
    },
    borrowed: async (api) => {
      const untitledHub = "0x2469362f63e9f593087EBbb5AC395CA607B5842F";
      const fromBlock = 1680171;
      
      const marketIds = await getMarkets(api, untitledHub, fromBlock);
      const marketInfo = await api.multiCall({
        target: untitledHub,
        calls: marketIds,
        abi: abi.idToMarketConfigs,
      });
      const marketData = await api.multiCall({
        target: untitledHub,
        calls: marketIds,
        abi: abi.market,
      });
      marketData.forEach((i, idx) => {
        api.add(marketInfo[idx].loanToken, i.totalBorrowAssets);
      });
      return api.getBalances();
    },
  }
};

async function getMarkets(api, untitledHub, fromBlock) {
  const logs = await getLogs({
    api,
    target: untitledHub,
    eventAbi:
      "event CreateMarket(uint256 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketConfigs)",
    onlyArgs: true,
    fromBlock,
    topics: [
      "0x50dbb004548668dc176490f07af2ba46de8f0721e795275b350a9415f1fa526b",
    ],
  });
  return logs.map((i) => i.id);
}