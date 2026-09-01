
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const MORPHO_BLUE_ADDRESS = "0x24147243f9c08d835C218Cda1e135f8dFD0517D0";

const BERACHAIN_API = "https://api.berachain.com";

const getWhitelistedVaults = async () => {
  const data = await cachedGraphQuery('bera-bend', BERACHAIN_API, `
      {
          polGetRewardVaults(where: {protocolsIn: ["Bend"], includeNonWhitelisted: false}) {
              vaults {
                  stakingTokenAddress
              }
          }
      }
  `);
  return data.polGetRewardVaults.vaults.map(v => v.stakingTokenAddress);
}

const getMarketFromWhitelistedVaults = async (api) => {
  const whitelistedVaults = await getWhitelistedVaults();

  const markets = await api.fetchList({ lengthAbi: 'withdrawQueueLength', itemAbi: "function withdrawQueue(uint256 index) view returns (bytes32)", targets: whitelistedVaults })
  return markets
}

const tvl = async (api) => {
  const markets = await getMarketFromWhitelistedVaults(api)
  const marketInfos = await api.multiCall({ target: MORPHO_BLUE_ADDRESS, calls: markets, abi: abi.idToMarketParams })
  const tokens = [...new Set(marketInfos.flatMap(({ collateralToken, loanToken }) => [collateralToken, loanToken]))].filter((token => token != nullAddress))
  return sumTokens2({ api, owner: MORPHO_BLUE_ADDRESS, tokens })
}

const borrowed = async (api) => {
  const markets = await getMarketFromWhitelistedVaults(api)
  const marketInfos = await api.multiCall({ target: MORPHO_BLUE_ADDRESS, calls: markets, abi: abi.idToMarketParams })
  const marketDatas = await api.multiCall({ target: MORPHO_BLUE_ADDRESS, calls: markets, abi: abi.market })

  marketDatas.forEach((data, idx) => {
    const { _, loanToken } = marketInfos[idx];
    api.add(loanToken, data.totalBorrowAssets);
  });
}

module.exports = {
  berachain: {
    tvl, borrowed
  }
}

const abi = {
  "idToMarketParams": "function idToMarketParams(bytes32 Id) returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)",
  "market": "function market(bytes32 input) returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)"
}
