const { request, gql } = require("graphql-request");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { staking } = require("../helper/staking");
const { getBlock } = require("../helper/getBlock");
const { toUSDTBalances } = require('../helper/balances');
const { fixHarmonyBalances } = require("../helper/portedTokens");

const addresses = {
  factory: "0x7d02c116b98d0965ba7b642ace0183ad8b8d2196",
  viper: "0xea589e93ff18b1a1f1e9bac7ef3e86ab62addc79",
  xviper: "0xe064a68994e9380250cfee3e8c0e2ac5c0924548",
}

async function graphTvl(timestamp, _ethBlock, chainBlocks) {
  const graphUrl = 'https://graph.viper.exchange/subgraphs/name/venomprotocol/venomswap-v2'
  const graphQuery = gql`
  query get_tvl($block: Int) {
    uniswapFactory(
      id: "${addresses.factory}",
      block: { number: $block }
    ) {
      totalLiquidityUSD
    },
  }`;
  
  const block = await getBlock(timestamp, "harmony", chainBlocks, false);

  const response = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );

  const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

const transforms = {
  "0x224e64ec1bdce3870a6a6c777edd450454068fec": "0xa47c8bf37f92abed4a126bda807a7b7498661acd", // ust
  "0xb12c13e66ade1f72f71834f2fc5082db8c091358": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", //avax
  "0x735abe48e8782948a37c7765ecb76b98cde97b0f": "0x4e15361fd6b4bb609fa63c81a2be19d873717870", //ftm
  "0xfbdd194376de19a88118e84e279b977f165d01b8": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", //matic
  // missing luna
}

async function tvl(timestamp, _ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "harmony", chainBlocks, true);
  const transformAddress = addr=>{
    return transforms[addr.toLowerCase()] ?? `harmony:${addr}`;
  }
  const balances = await calculateUniTvl(transformAddress, block, "harmony", addresses.factory, 0, true)
  fixHarmonyBalances(balances)

  return balances
}

module.exports = {
  harmony: {
    tvl,
    staking: staking(addresses.xviper, addresses.viper, "harmony"),
  },
};
