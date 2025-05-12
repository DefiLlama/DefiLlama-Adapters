const ADDRESSES = require('../../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const { blockQuery } = require("../../helper/http");
const { endpoints } = require("../constants/endpoints");

const NEGATIVE_WAD_PRECISION = -18;
const WETH_ADDRESS = ADDRESSES.ethereum.WETH;

// aave/aavev3/spark are in one endpoint
const aaveLikeQuery = (block) => `
query {
  positions(first: 10000, where: {
    and: [
      { collateral_gt: 0 },
      { or: [{ protocol: "AAVE" }, { protocol: "AAVE_V3" }, { protocol: "Spark" }] }
    ]
  }, block: { number: ${block} }) {
    collateral
    collateralAddress
  }
}`;

// morpho blue has a separate endpoint
const morphoBlueQuery = (block) => `
query {
  borrowPositions(where: {collateral_gt: 0}, block: { number: ${block} }) {
    collateralAmount: collateral
    market {
      collateralToken {
        address
      }
    }
  }
}`

// ajna has a separate endpoint
const ajnaQuery = (block) => `
query {
  accounts(first: 10000, where: {
    and: [
      { isDPM: true },
      {
        borrowPositions_: {
          debt_gt: 0
        }
      }
      { protocol: "Ajna_rc13" },
    ]
  }, block: { number: ${block} }) {
    collateralToken
    borrowPositions {
      collateral
    }
    id
  }
  pools(block: { number: ${block} }) {
    address
    depositSize
    debt
    quoteTokenAddress
  }
}`;

const dpmPositions = async ({ api, }) => {
  console.log('api.block', api.block);
  
  const aaveLike = await blockQuery(`${endpoints.summerHistory()}/summer-oasis-history`, aaveLikeQuery(api.block - 500), { api,  })
  const ajna = await blockQuery(`${endpoints.summerHistory()}/summer-ajna-v2`, ajnaQuery(api.block - 500), { api, })
  const morphoBlue = await blockQuery(`${endpoints.summerHistory()}/summer-morpho-blue`, morphoBlueQuery(api.block - 500), { api, })

  const supportedAjnaPools = [
    ...new Set(ajna.accounts.map(({ id }) => id)),
  ];

  const aaveLikeBorrowishPositions = aaveLike.positions.map(
    ({ collateral, collateralAddress }) => ({
      collateral: new BigNumber(collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress,
    })
  );

  const ajnaBorrowishPositions = ajna.accounts
    .filter(({ borrowPositions }) => borrowPositions.length)
    .map(({ borrowPositions: [{ collateral }], collateralToken }) => ({
      collateral: new BigNumber(collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress: collateralToken,
    }));

  const morphoBlueBorrowishPositions = morphoBlue.borrowPositions.map(
    ({ collateralAmount, market }) => ({
      collateral: new BigNumber(Number(collateralAmount)).shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress: market.collateralToken.address,
    })
  );

  const ajnaEarnPositions = ajna.pools
    .filter(({ address }) => supportedAjnaPools.includes(address))
    .map(({ debt, depositSize, quoteTokenAddress }) => ({
      collateral: new BigNumber(depositSize)
        .minus(new BigNumber(debt))
        .shiftedBy(NEGATIVE_WAD_PRECISION),
      collateralAddress: quoteTokenAddress,
    }));

  const tokensWithAmounts = [
    ...aaveLikeBorrowishPositions,
    ...ajnaBorrowishPositions,
    ...ajnaEarnPositions,
    ...morphoBlueBorrowishPositions
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
