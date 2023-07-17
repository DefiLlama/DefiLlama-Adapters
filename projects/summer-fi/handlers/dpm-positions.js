const BigNumber = require("bignumber.js");
const { blockQuery } = require("../../helper/http");

const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const subgraphs = {
  aave: "https://graph.summer.fi/subgraphs/name/oasis/oasis-history",
};

const getLatestBlockIndexed = `
query {
  positions(first: 10000, where: {
    and: [
      { collateral_gt: 0 },
      { or: [{ protocol: "AAVE" }, { protocol: "AAVE_V3" }] }
    ]
  }) {
    collateral
    collateralAddress
  }
}`;

const dpmPositions = async ({ api }) => {
  const aave = (
    await blockQuery(subgraphs.aave, getLatestBlockIndexed, { api })
  ).positions.reduce(
    (total, { collateral, collateralAddress }) => ({
      ...total,
      [collateralAddress]: total[collateralAddress]
        ? total[collateralAddress].plus(new BigNumber(collateral))
        : new BigNumber(collateral),
    }),
    {}
  );
  const fallbackDecimal = await api.call({
    abi: "erc20:decimals",
    target: WETH_ADDRESS,
  });
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: Object.keys(aave),
  });

  Object.keys(aave).forEach((collateralAddress, i) => {
    api.add(
      collateralAddress,
      aave[collateralAddress].toNumber() *
        10 ** (decimals[i] || fallbackDecimal)
    );
  });
};

module.exports = {
  dpmPositions,
};
