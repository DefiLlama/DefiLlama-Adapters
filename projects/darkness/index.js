const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock');
const { addFundsInMasterChef } = require("../helper/masterchef");
const masterChef = "0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5";
const d3usd = "0x36B17c6719e09d98bB020608E9F79a0647d50A70";
const dusd = "0x6582c738660bf0701f05b04dce3c4e5fcfcda47a";

const usdc = "0xc21223249ca28397b4b6541dffaecc539bff0c59";

async function getLiquidity(block) {
  // delayed by around 5 mins to allow subgraph to update
  block -= 25;
  var endpoint = `https://subgraph.darkness.finance/subgraphs/name/cronos/swapprod`
  var graphQLClient = new GraphQLClient(endpoint)
  var query = gql`
  query get_tvl($block: Int) {
    balancers(
      first: 5,
      block: { number: $block }
    ) {
      totalLiquidity,
      totalSwapVolume
    }
  }
  `;
  const results = await graphQLClient.request(query, {
    block
  })
  return results.balancers[0].totalLiquidity;
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = toUSDTBalances(await getLiquidity(await getBlock(timestamp, "cronos", chainBlocks)));

  //Farm MEERKAT-LP on mm.finance
  await addFundsInMasterChef(
    balances,
    masterChef,
    chainBlocks.cronos,
    "cronos",
    (addr) => `cronos:${addr}`,
    undefined,
    [dusd, d3usd], //ignore D3USD because it has been counted in liquidity
    true,
    true,
    d3usd,
  );

  //Add DUSD in DUSD/USDC-LP pool
  sdk.util.sumSingleBalance(
    balances,
    `cronos:${usdc}`,
    balances[`cronos:${usdc}`],
  );

  return balances;
}

module.exports = {
  methodology: `DarkNess TVL is pulled from the DarkNess subgraph and MEERKAT-LP (on mm.finance) locked in MasterChef (0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5) , excluded D3USD that has been counted in liquidity`,
  cronos: {
    tvl: tvl,
  },
};
