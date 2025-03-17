const { getLogs2 } = require("../helper/cache/getLogs")
const { sumTokens2 } = require('../helper/unwrapLPs')
const { aaveExports } = require('../helper/aave');
const { mergeExports } = require("../helper/utils");

const abi = {
  "idToMarketParams": "function idToMarketParams(bytes32 Id) returns (bool isPremiumMarket, address loanToken, address collateralToken, address oracle, address irm, uint256 lltv, address creditAttestationService, uint96 irxMaxLltv, uint256[] categoryLltv)",
  "market": "function market(bytes32 input) returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee, uint256 premiumFee)"
}

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
  const { moreMarkets, fromBlock, moreAaveForkMarkets = [] } = config[chain];

  const tvl = async (api) => {
    const marketIds = await getMarkets(api);
    const tokens = (await api.multiCall({ target: moreMarkets, calls: marketIds, abi: abi.idToMarketParams, }))
      .map((i) => [i.collateralToken, i.loanToken])
      .flat();
    return sumTokens2({ api, owner: moreMarkets, tokens, });
  }

  const borrowed = async (api) => {
    const marketIds = await getMarkets(api);
    const marketInfo = await api.multiCall({ target: moreMarkets, calls: marketIds, abi: abi.idToMarketParams, });
    const marketData = await api.multiCall({ target: moreMarkets, calls: marketIds, abi: abi.market, });
    marketData.forEach((i, idx) => {
      api.add(marketInfo[idx].loanToken, i.totalBorrowAssets);
    });
    return sumTokens2({ api })
  }

  const chainObjects = [{ tvl, borrowed, }]
  moreAaveForkMarkets.forEach((i) => {
    chainObjects.push(aaveExports(chain, '', undefined, [i], { v3: true }))
  })

  module.exports[chain] = mergeExports(chainObjects.map(i => ({ [chain]: i })))[chain]

  async function getMarkets(api) {
    const logs = await getLogs2({
      api,
      target: moreMarkets,
      eventAbi: "event CreateMarket(bytes32 indexed id, (bool,address,address,address,address,uint256,address,uint96,uint256[]) marketParams)",
      fromBlock,
    });
    return logs.map((i) => i.id);
  }

})