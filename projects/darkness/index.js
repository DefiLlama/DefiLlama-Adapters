const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock');
const { addFundsInMasterChef } = require("../helper/masterchef");
const { farmLPBalance } = require("./utils");

const masterChef = "0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5";
const d3usd = "0x36B17c6719e09d98bB020608E9F79a0647d50A70";
const ness = "0xe727240728c1a5f95437b8b50afdd0ea4ae5f0c8";


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
    [d3usd, ness], //Ignore D3USD because it has been counted in liquidity. 
    true,
    true,
    ness,
  );

  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  const ness_cro = "0xbfAAB211C3ea99A2Db682fbc1D9a999861dCba2D";
  const cro = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";

  return farmLPBalance(
    'cronos',
    block,
    masterChef,
    ness_cro,
    cro,
    ness,
  );
}

module.exports = {
  methodology: `DarkNess TVL is pulled from the DarkNess subgraph and MEERKAT-LP (on mm.finance) locked in MasterChef (0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5) , excluded D3USD that has been counted in liquidity`,
  cronos: {
    tvl: tvl,
    pool2: pool2,
  }
};
