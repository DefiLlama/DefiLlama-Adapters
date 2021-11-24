const { request, gql } = require("graphql-request");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { staking } = require("../helper/staking");
const { getBlock } = require("../helper/getBlock");
const { fixHarmonyBalances, transformHarmonyAddress } = require("../helper/portedTokens");

const graphUrl =
  "https://graph.defikingdoms.com/subgraphs/name/defikingdoms/dex";
const graphQuery = gql`
  query get_tvl($block: Int) {
    uniswapFactory(
      id: "0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7"
      block: { number: $block }
    ) {
      totalLiquidityUSD
    }
  }
`;

const transforms = {
  "0x224e64ec1bdce3870a6a6c777edd450454068fec": "0xa47c8bf37f92abed4a126bda807a7b7498661acd", // ust
  "0xb12c13e66ade1f72f71834f2fc5082db8c091358": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", //avax
  "0x735abe48e8782948a37c7765ecb76b98cde97b0f": "0x4e15361fd6b4bb609fa63c81a2be19d873717870", //ftm
  "0xfbdd194376de19a88118e84e279b977f165d01b8": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", //matic
  // missing luna
}

const factory = "0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7"
async function tvl(timestamp, _ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "harmony", chainBlocks);
  const transformAddress = addr=>{
    return transforms[addr.toLowerCase()] ?? `harmony:${addr}`;
  }
  const balances = await calculateUniTvl(transformAddress, block, "harmony", factory, 0, true)
  fixHarmonyBalances(balances)

  return balances

}

module.exports = {
  harmony: {
    tvl,
    staking: staking("0xa9ce83507d872c5e1273e745abcfda849daa654f", "0x72cb10c6bfa5624dd07ef608027e366bd690048f", "harmony"),
  },
};
