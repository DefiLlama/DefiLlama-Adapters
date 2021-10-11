const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { BigNumber } = require("bignumber.js");
const queryUrl = "https://api.thegraph.com/subgraphs/name/emiswap/emiswap";

const queryFieldEthTvl = gql`
  query getLiquidity($block: Int) {
    emiswapFactories(block: $block) {
      totalLiquidityUSD
    }
  }
`;

async function ethTvl(timestamp, block) {
  let balances = {};
  let response = await request(queryUrl, queryFieldEthTvl);
  let balance = BigNumber(response.emiswapFactories[0].totalLiquidityUSD)
    .times(10 ** 6)
    .toFixed(0);
  sdk.util.sumSingleBalance(
    balances,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    balance
  );
  return balances;
}

const eswToken = "0x5a75a093747b72a0e14056352751edf03518031d";
const stakingPool = "0xe094E3E16e813a40E2d6cC4b89bfeAe0142044e1";

async function ethStaking(timestamp, block) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: eswToken,
    owner: stakingPool,
    block,
  });
  sdk.util.sumSingleBalance(balances, eswToken, balance);

  return balances;
}

module.exports = {
  methodology: "ETH TVL are the total liquidity from the LPs according to the subgraph. Staking TVL would be ESW value in the staking pool.",
  ethereum: {
    tvl: ethTvl,
    staking: ethStaking,
  },
  tvl: ethTvl,
};
