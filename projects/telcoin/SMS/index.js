const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const graphUrl = "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06";

const graphQuery = gql`
  query get_tvl($block: Int, $id: ID!) {
    uniswapFactory(id: $id, block: { number: $block }) {
      totalVolumeUSD
      totalLiquidityUSD
    }
  }
`;

const lpAdresses = [
  "0xa5cabfc725dfa129f618d527e93702d10412f039", // USDC
  //"0xe88e24f49338f974b528ace10350ac4576c5c8a1", // QUICK
  //"0xfc2fc983a411c4b1e238f7eb949308cf0218c750", // WETH
  //"0x9b5c71936670e9f1f36e63f03384de7e06e60d2a", // WMATIC
  //"0x4917bc6b8e705ad462ef525937e7eb7c6c87c356", // AAVE
  //"0xaddc9c73f3cbad4e647eaff691715898825ac20c", // WBTC
];

async function tvl(timestamp, id, block, chainBlocks) {
  const results = await Promise.all(
    lpAdresses.map((address) => {
      request(graphUrl, graphQuery, {
        id: address,
        block: chainBlocks["polygon"],
      });
    })
  );

  return results.reduce((total, { uniswapFactory }) => {
    return total + toUSDTBalances(Number(uniswapFactory.totalLiquidityUSD));
  }, 0);
}

module.exports = {
  polygon: {
    tvl,
  },
  tvl,
};