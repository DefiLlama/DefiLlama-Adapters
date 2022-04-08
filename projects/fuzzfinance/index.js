// const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
// const { toUSDTBalances } = require('../helper/balances');
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { fixHarmonyBalances } = require("../helper/portedTokens");

const fuzz = "0x984b969a8e82f5ce1121ceb03f96ff5bb3f71fee";
const factory = "0x5245d2136dc79Df222f00695C0c29d0c4d0E98A6";
const masterchef = "0x847b46ed6c3df75e34a0496ef148b89bf5eb41b1";

// const graphUrl = 'https://graph.fuzz.fi/subgraphs/name/fuzzfinance/fuzzswap'
// const graphQuery = gql`
// query get_tvl($block: Int) {
//   uniswapFactory(
//     id: "0x5245d2136dc79Df222f00695C0c29d0c4d0E98A6",
//     block: { number: $block }
//   ) {
//     totalLiquidityUSD
//   },
// }
// `;

async function tvl(timestamp, block, chainBlocks) {
  // const {block} = await sdk.api.util.lookupBlock(timestamp,{
  //   chain: 'harmony'
  // })
  // const response = await request(
  //   graphUrl,
  //   graphQuery,
  //   {
  //     block,
  //   }
  // );

  // const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD)

  // return toUSDTBalances(usdTvl)
  let balances = await calculateUniTvl(
    (addr) => {
      if (addr === "0x224e64ec1bdce3870a6a6c777edd450454068fec") {
        return "0xa47c8bf37f92abed4a126bda807a7b7498661acd";
      }
      return `harmony:${addr}`;
    },
    chainBlocks.harmony,
    "harmony",
    factory,
    0,
    true
  );
  fixHarmonyBalances(balances);
  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (
    await sdk.api.erc20.balanceOf({
      target: fuzz,
      owner: masterchef,
      block: chainBlocks.harmony,
      chain: "harmony",
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `harmony:${fuzz}`, balance);
  return balances;
}

module.exports = {
  methodology: `Counts the tokens locked on AMM pools from the factory contract.`,
  harmony: {
    tvl,
    staking,
  },
  tvl,
};
