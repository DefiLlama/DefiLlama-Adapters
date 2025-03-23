const BigNumber = require("bignumber.js");
const { getLogs2 } = require('../helper/cache/getLogs');

const config = {
  berachain: { dahlia: '0x28cB92818a73A699CD2aC3B3375ac3C4E01C3a4f', fromBlock: 604350 },
};

module.exports = {
  methodology: "TVL = Total Lent - Total Borrow",
};

const getDeployedMarketIds = async (api, dahlia, fromBlock) => {
  const eventAbi = "event DeployMarket(uint32 indexed id, address indexed vault, tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv, uint256 liquidationBonusRate, string name, address owner) marketConfig)";
  const logs = await getLogs2({ api, eventAbi, target: dahlia, fromBlock, topics: ["0xbe9a2432e4c18ee1eb6ab3ce194836a0257e410c7cc435b4c31ac111a0b90e22"] });
  return logs.map(log => log.id);
}

const getMarketValues = async (api, marketIds, dahlia, chain) => {
  return await api.multiCall({
    abi: "function getMarket(uint32 id) view returns (tuple(uint24 lltv, uint8 status, address loanToken, address collateralToken, uint48 updatedAt, uint24 protocolFeeRate, address oracle, uint24 liquidationBonusRate, uint64 fullUtilizationRate, address irm, uint64 ratePerSec, address vault, uint48 repayPeriodEndTimestamp, uint256 totalLendAssets, uint256 totalLendShares, uint256 totalBorrowAssets, uint256 totalBorrowShares, uint256 totalLendPrincipalAssets, uint256 totalCollateralAssets))",
    calls: marketIds,
    target: dahlia,
    chain,
  });
}

Object.keys(config).forEach(chain => {
  const { dahlia, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const marketIds = await getDeployedMarketIds(api, dahlia, fromBlock);
      const marketValues = await getMarketValues(api, marketIds, dahlia, chain);

      for (const market of marketValues) {
        const loanToken = market.loanToken;
        const totalLendAssets = BigNumber(market.totalLendAssets);
        const totalBorrowAssets = BigNumber(market.totalBorrowAssets);
        const marketTVL = totalLendAssets.minus(totalBorrowAssets).toFixed(0);
        api.add(loanToken, marketTVL);
      }
    },
    borrowed: async (api) => {
      const marketIds = await getDeployedMarketIds(api, dahlia, fromBlock);
      const marketValues = await getMarketValues(api, marketIds, dahlia, chain);

      for (const market of marketValues) {
        const loanToken = market.loanToken;
        const totalBorrowAssets = market.totalBorrowAssets;
        api.add(loanToken, totalBorrowAssets);
      }
    }
  }
});
// node test.js projects/dahlia/index.js
