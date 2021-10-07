const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const queryUrl =
  "https://api.thegraph.com/subgraphs/name/polycatfi/polycat-finance-amm";
const { BigNumber } = require("bignumber.js");

const queryFieldPolygonTvl = gql`
  query getPools($block: Int) {
    pairs(orderBy: reserveUSD, orderDirection: desc) {
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      reserveUSD
    }
  }
`;

async function polygonTvl(timestmap, blocks, chainBlocks) {
  let balances = {};
  let { pairs: result } = await request(queryUrl, queryFieldPolygonTvl);
  for (let i = 0; i < result.length; i++) {
    let symbol0 = result[i].token0.symbol;
    let symbol1 = result[i].token1.symbol;
    if (
      symbol0 === "PAW" ||
      symbol1 === "PAW" ||
      symbol0 === "FISH" ||
      symbol1 === "FISH"
    ) {
      continue;
    }
    let reserve = BigNumber(result[i].reserveUSD)
      .times(10 ** 6)
      .toFixed(0);
    sdk.util.sumSingleBalance(
      balances,
      `polygon:${"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}`,
      reserve
    );
  }
  return balances;
}

async function polygonPool2Tvl(timestamp, blocks, chainBlocks) {
  let balances = {};
  let { pairs: result } = await request(queryUrl, queryFieldPolygonTvl);
  for (let i = 0; i < result.length; i++) {
    let symbol0 = result[i].token0.symbol;
    let symbol1 = result[i].token1.symbol;
    if (
      symbol0 === "PAW" ||
      symbol1 === "PAW" ||
      symbol0 === "FISH" ||
      symbol1 === "FISH"
    ) {
      let reserve = BigNumber(result[i].reserveUSD)
        .times(10 ** 6)
        .toFixed(0);
      sdk.util.sumSingleBalance(
        balances,
        `polygon:${"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}`,
        reserve
      );
    }
  }
  return balances;
}

module.exports = {
  polygon: {
    tvl: polygonTvl,
    pool2: polygonPool2Tvl,
  },
};
