const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const { toUSDTBalances, usdtAddress } = require("../helper/balances");
const { getBlock } = require("../helper/getBlock");

const SUBGRAPH_NAME = Object.freeze({
  ethereum: "swapr-mainnet-alpha",
  xdai: "swapr-xdai",
  arbitrum: "swapr-arbitrum-one",
});

const FACTORY_ADDRESS = Object.freeze({
  ethereum: "0xd34971BaB6E5E356fd250715F5dE0492BB070452",
  xdai: "0x5d48c95adffd4b40c1aaadc4e08fc44117e02179",
  arbitrum: "0xbf9173b60a30b9ff8c37cac787b6ee87d5e47916",
});

const QUERY = gql`
  query getTvl($block: Int, $factory: ID) {
    swaprFactory(id: $factory, block: { number: $block }) {
      totalLiquidityUSD
    }
  }
`;

async function getTvl(timestamp) {
  const { swaprFactory } = await request(
    `https://api.thegraph.com/subgraphs/name/luzzif/${
      SUBGRAPH_NAME[this.chain]
    }`,
    QUERY,
    {
      block: await getBlock(timestamp, this.chain, {}),
      factory: FACTORY_ADDRESS[this.chain],
    }
  );
  return toUSDTBalances(Number(swaprFactory.totalLiquidityUSD));
}

const xDaiTvl = getTvl.bind({ chain: "xdai" });
const ethereumTvl = getTvl.bind({ chain: "ethereum" });
const arbitrumTvl = getTvl.bind({ chain: "arbitrum" });

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: xDaiTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
  tvl: sdk.util.sumChainTvls([ethereumTvl, xDaiTvl, arbitrumTvl]),
  name: "Swapr",
  category: "dexes",
};
