const ADDRESSES = require("../../helper/coreAssets.json");
const BigNumber = require("bignumber.js");
const { blockQuery } = require("../../helper/http");
const { endpoints } = require("../constants/endpoints");

const NEGATIVE_WAD_PRECISION = -18;
const WETH_ADDRESS = ADDRESSES.ethereum.WETH;

const aaveQuery = (block) => `
query {
  positions(first: 10000, where: {
    and: [
      { collateral_gt: 0 },
      { or: [{ protocol: "AAVE" }, { protocol: "AAVE_V3" }] }
    ]
  }, block: { number: ${block} }) {
    collateral
    collateralAddress
  }
}`;

const ajnaQuery = (block) => `
query {
  borrowPositions(first: 10000, where: { account_not: null }, block: { number: ${block} }) {
    collateral
    pool {
      collateralAddress
      quoteTokenAddress
    }
  }
  earnPositions(first: 10000, where: { account_not: null }, block: { number: ${block} }) {
    earnCumulativeQuoteTokenDeposit
    earnCumulativeQuoteTokenWithdraw
    pool {
      collateralAddress
      quoteTokenAddress
    }
  }
}`;

const dpmPositions = async ({ api }) => {
  const aave = await blockQuery(endpoints.aave(), aaveQuery(api.block - 500), {
    api,
  });
  const ajna = await blockQuery(endpoints.ajna(), ajnaQuery(api.block - 500), {
    api,
  });

  const aaveBorrowishPositions = aave.positions.map(
    ({ collateral, collateralAddress }) => ({
      collateral: new BigNumber(collateral),
      collateralAddress,
    })
  );
  const ajnaBorrowishPositions = ajna.borrowPositions.map(
    ({ collateral, pool: { collateralAddress, quoteTokenAddress } }) => ({
      collateral: new BigNumber(collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress: collateralAddress,
    })
  );
  const ajnaEarnPositions = ajna.earnPositions.map(
    ({
      earnCumulativeQuoteTokenDeposit,
      earnCumulativeQuoteTokenWithdraw,
      pool: { quoteTokenAddress },
    }) => ({
      collateral: new BigNumber(earnCumulativeQuoteTokenDeposit).minus(
        new BigNumber(earnCumulativeQuoteTokenWithdraw)
      ),
      collateralAddress: quoteTokenAddress,
    })
  );

  const tokensWithAmounts = [
    ...aaveBorrowishPositions,
    ...ajnaBorrowishPositions,
    ...ajnaEarnPositions,
  ].reduce(
    (total, { collateral, collateralAddress }) => ({
      ...total,
      [collateralAddress]: total[collateralAddress]
        ? total[collateralAddress].plus(collateral)
        : collateral,
    }),
    {}
  );

  const fallbackDecimal = await api.call({
    abi: "erc20:decimals",
    target: WETH_ADDRESS,
  });
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: Object.keys(tokensWithAmounts),
  });

  Object.keys(tokensWithAmounts).forEach((collateralAddress, i) => {
    api.add(
      collateralAddress,
      tokensWithAmounts[collateralAddress].toNumber() *
        10 ** (decimals[i] || fallbackDecimal)
    );
  });
};

module.exports = {
  dpmPositions,
};
