const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const abi = {
  idToMarketParams:
    "function idToMarketParams(bytes32 Id) returns (bool isPremiumMarket, address loanToken, address collateralToken, address oracle, address irm, uint256 lltv, address creditAttestationService, uint96 irxMaxLltv, uint256[] categoryLltv)",
  market:
    "function market(bytes32 input) returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee, uint256 premiumFee)",
  getReserveTokensAddresses:
    "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  getAllReservesTokens:
    "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
  getReserveData:
    "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the MORE Markets contracts`,
};

const config = {
  flow: {
    moreMarkets: "0x94A2a9202EFf6422ab80B6338d41c89014E5DD72",
    fromBlock: 2871764,
    moreAaveForkMarkets: ["0x79e71e3c0EDF2B88b0aB38E9A1eF0F6a230e56bf"],
  },
};

Object.keys(config).forEach((chain) => {
  const poolDatas = config[chain].moreAaveForkMarkets;
  const { moreMarkets, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const marketIds = await getMarkets(api);
      const tokens = (
        await api.multiCall({
          target: moreMarkets,
          calls: marketIds,
          abi: abi.idToMarketParams,
        })
      )
        .map((i) => [i.collateralToken, i.loanToken])
        .flat();

      await fetchReserveData(api, poolDatas);

      return sumTokens2({ api, owner: moreMarkets, tokens });
    },
    borrowed: async (api) => {
      const marketIds = await getMarkets(api);
      const marketInfo = await api.multiCall({
        target: moreMarkets,
        calls: marketIds,
        abi: abi.idToMarketParams,
      });
      const marketData = await api.multiCall({
        target: moreMarkets,
        calls: marketIds,
        abi: abi.market,
      });
      marketData.forEach((i, idx) => {
        api.add(marketInfo[idx].loanToken, i.totalBorrowAssets);
      });

      await fetchReserveData(api, poolDatas, true);

      return sumTokens2({ api });
    },
  };

  const fetchReserveData = async (api, poolDatas, isBorrowed) => {
    const reserveTokens = await api.multiCall({
      calls: poolDatas,
      abi: abi.getAllReservesTokens,
    });
    const calls = [];

    poolDatas.map((pool, i) => {
      reserveTokens[i].forEach(({ tokenAddress }) =>
        calls.push({ target: pool, params: tokenAddress })
      );
    });
    const reserveData = await api.multiCall({
      abi: isBorrowed ? abi.getReserveData : abi.getReserveTokensAddresses,
      calls,
    });
    const tokensAndOwners = [];
    reserveData.forEach((data, i) => {
      const token = calls[i].params;
      if (isBorrowed) {
        api.add(token, data.totalVariableDebt);
        api.add(token, data.totalStableDebt);
      } else tokensAndOwners.push([token, data.aTokenAddress]);
    });

    if (isBorrowed) return api.getBalances();
    return api.sumTokens({ tokensAndOwners });
  };

  async function getMarkets(api) {
    const logs = await getLogs2({
      api,
      target: moreMarkets,
      eventAbi:
        "event CreateMarket(bytes32 indexed id, (bool,address,address,address,address,uint256,address,uint96,uint256[]) marketParams)",
      fromBlock,
    });
    return logs.map((i) => i.id);
  }
});
