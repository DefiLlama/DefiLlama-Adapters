const sdk = require("@defillama/sdk");
const { gql, default: request } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const graphUrls = {
  harmony: "https://graph.hermesdefi.io/subgraphs/name/exchange",
};
const graphxHermesUrl = "https://graph.hermesdefi.io/subgraphs/name/bar"
const graphsHermesUrl= "https://graph.hermesdefi.io/subgraphs/name/shermes"

const xHermesQuery = gql`
query xHermesStaked{
  bar(id: "0x28a4e128f823b1b3168f82f64ea768569a25a37f"){
    hermesStaked
    hermesStakedUSD
  }
}
`
const sHermesQuery = gql `
query sHermesStaked{
  stableHermes(id: "0x8812420fb6e5d971c969ccef2275210ab8d014f0"){
    hermesStaked
    hermesStakedUSD
  }
}
`
async function staking(){
  const { bar } = await request(graphxHermesUrl, xHermesQuery);
  const { stableHermes } = await request(graphsHermesUrl, sHermesQuery);
  const usdTvl = Number(bar.hermesStakedUSD) + Number(stableHermes.hermesStakedUSD);
  return toUSDTBalances(usdTvl);
}
module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology:
    'We calculate liquidity on all pairs with data retreived from the "hermes-defi/hermes-graph" subgraph plus the total amount in dollars of our staking pools xHermes and sHermes.',
  harmony: {
    tvl: getChainTvl(graphUrls, "factories", "liquidityUSD")("harmony"),
    staking: staking
  },
};
