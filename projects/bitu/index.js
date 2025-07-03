const ADDRESSES = require("../helper/coreAssets.json");
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const { sumUnknownTokens } = require("../helper/unknownTokens");

const graphUrl = "https://api.studio.thegraph.com/query/70783/bitu-protocol/version/latest";
const graphQuery = gql`
  query GET_COLLAERTAL_ASSETS {
    collateralAssets(first: 100) {
      id
      symbol
      name
      decimals
      totalValueLocked
      bituLiquidated
    }
  }
`;

const USDT = ADDRESSES.bsc.USDT;

module.exports = {
  bsc: {
    tvl: async (api) => {
      const { collateralAssets } = await request(graphUrl, graphQuery);

      let liquidated = new BigNumber(0);

      for (const item of collateralAssets) {
        if (item.id.toLocaleLowerCase() !== USDT.toLocaleLowerCase()) liquidated = liquidated.plus(item.bituLiquidated);
      }

      const nativeToken = collateralAssets.find((p) => p.id === ADDRESSES.GAS_TOKEN_2);

      const erc20Tokens = collateralAssets
        .filter((p) => p.id !== ADDRESSES.GAS_TOKEN_2)
        .map((p) => {
          if (p.id.toLocaleLowerCase() === USDT.toLocaleLowerCase()) {
            p.totalValueLocked = liquidated.plus(p.totalValueLocked).multipliedBy(Math.pow(10, p.decimals)).toString();
          } else {
            p.totalValueLocked = new BigNumber(p.totalValueLocked).multipliedBy(Math.pow(10, p.decimals)).toString();
          }

          return p;
        });
      api.addTokens(
        erc20Tokens.map((p) => p.id),
        erc20Tokens.map((p) => p.totalValueLocked)
      );
      if (nativeToken) {
        api.add("coingecko:binancecoin", parseInt(nativeToken.totalValueLocked), { skipChain: true });
      }
    },
  },
};
