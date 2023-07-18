const BigNumber = require("bignumber.js");
const { blockQuery } = require("../../helper/http");

const NEGATIVE_WAD_PRECISION = -18;
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const subgraphs = {
  aave: "",
  ajna: "",
};

const aaveQuery = `
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
const ajnaQuery = `
query {
  accounts(first: 10000, where: {
    and: [
      { isDPM: true },
      { protocol: "Ajna" },
    ]
  }) {
    collateralToken
    borrowPositions {
      collateral
    }
    pool {
      address
    }
  }
  pools {
    address
    depositSize
    debt
    quoteTokenAddress
  }
}`;

const dpmPositions = async ({ api }) => {
  const aave = await blockQuery(subgraphs.aave, aaveQuery, { api });
  const ajna = await blockQuery(subgraphs.ajna, ajnaQuery, { api });

  const supportedAjnaPools = [
    ...new Set(ajna.accounts.map(({ pool: { address } }) => address)),
  ];

  const aaveBorrowishPositions = aave.positions.map(
    ({ collateral, collateralAddress }) => ({
      collateral: new BigNumber(collateral),
      collateralAddress,
    })
  );
  const ajnaBorrowishPositions = ajna.accounts
    .filter(({ borrowPositions }) => borrowPositions.length)
    .map(({ borrowPositions: [{ collateral }], collateralToken }) => ({
      collateral: new BigNumber(collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress: collateralToken,
    }));
  const ajnaEarnPositions = ajna.pools
    .filter(({ address }) => supportedAjnaPools.includes(address))
    .map(({ debt, depositSize, quoteTokenAddress }) => ({
      collateral: new BigNumber(depositSize)
        .minus(new BigNumber(debt))
        .shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress: quoteTokenAddress,
    }));

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
