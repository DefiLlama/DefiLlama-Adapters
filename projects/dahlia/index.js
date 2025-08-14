const BigNumber = require("bignumber.js");
const { getLogs2 } = require('../helper/cache/getLogs');

const config = {
  berachain: { dahlia: '0x28cB92818a73A699CD2aC3B3375ac3C4E01C3a4f', fromBlock: 604319 },
};

module.exports = {
  methodology: "TVL = Total Lent - Total Borrow",
};

const getDeployedMarketIds = async (api, dahlia, fromBlock) => {
  const eventAbi = "event DeployMarket(uint32 indexed id, address indexed vault, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv, uint256 liquidationBonusRate, string name, address owner) marketConfig)"
  const logs = await getLogs2({ api, eventAbi, target: dahlia, fromBlock, topics: ['0xbe9a2432e4c18ee1eb6ab3ce194836a0257e410c7cc435b4c31ac111a0b90e22'], extraKey: 'deployed' });
  console.log(logs)
  return logs.map(log => log.id);
}

const getMarketValues = async (api, marketIds, dahlia) => {
  return await api.multiCall({
    abi: "function getMarket(uint32 id) view returns (tuple(uint24 lltv, uint8 status, address loanToken, address collateralToken, uint48 updatedAt, uint24 protocolFeeRate, address oracle, uint24 liquidationBonusRate, uint64 fullUtilizationRate, address irm, uint64 ratePerSec, address vault, uint48 repayPeriodEndTimestamp, uint256 totalLendAssets, uint256 totalLendShares, uint256 totalBorrowAssets, uint256 totalBorrowShares, uint256 totalLendPrincipalAssets, uint256 totalCollateralAssets))",
    calls: marketIds,
    target: dahlia,
  });
}

async function getTvl(api, isBorrowed = false) {
  const { dahlia, fromBlock } = config[api.chain]
  const markets = []
  let hasMore = true

  let batchSize = 10
  let i = 0

  do {
    const _markets = await api.multiCall({
      abi: "function getMarket(uint32 id) view returns (tuple(uint24 lltv, uint8 status, address loanToken, address collateralToken, uint48 updatedAt, uint24 protocolFeeRate, address oracle, uint24 liquidationBonusRate, uint64 fullUtilizationRate, address irm, uint64 ratePerSec, address vault, uint48 repayPeriodEndTimestamp, uint256 totalLendAssets, uint256 totalLendShares, uint256 totalBorrowAssets, uint256 totalBorrowShares, uint256 totalLendPrincipalAssets, uint256 totalCollateralAssets))",
      calls: Array.from({ length: batchSize }, (_, idx) => i + idx),
      permitFailure: true,
      target: dahlia,
    })
    markets.push(..._markets.filter(i => i))
    i += batchSize
    hasMore = _markets.filter(i => i).length === batchSize
  } while (hasMore)


  const tokensAndOwners = []

  for (const market of markets) {
    const loanToken = market.loanToken;
    const totalLendAssets = BigNumber(market.totalLendAssets);
    const totalBorrowAssets = BigNumber(market.totalBorrowAssets);
    if (isBorrowed) {
      api.add(loanToken, totalBorrowAssets);
    } else {
      tokensAndOwners.push([market.loanToken, market.vault])
      tokensAndOwners.push([market.collateralToken, market.vault])
      tokensAndOwners.push([market.loanToken, dahlia])
      tokensAndOwners.push([market.collateralToken, dahlia])
      // const marketTVL = totalLendAssets.minus(totalBorrowAssets).toFixed(0);
      // api.add(loanToken, marketTVL);
    }
  }
  return api.sumTokens({ tokensAndOwners })
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api),
    borrowed: async (api) => getTvl(api, true),
  }
});