const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const { toUSDTBalances, usdtAddress } = require("../helper/balances");
const { default: BigNumber } = require("bignumber.js");

const graphUrl = {
  ethereum:
    "https://api.thegraph.com/subgraphs/name/luzzif/swapr-mainnet-alpha",
  xdai: "https://api.thegraph.com/subgraphs/name/luzzif/swapr-xdai",
};

const factoryAddress = {
  ethereum: "0xd34971BaB6E5E356fd250715F5dE0492BB070452",
  xdai: "0x5d48c95adffd4b40c1aaadc4e08fc44117e02179",
};

const graphQuery = gql`
  query getTvl($block: Int, $factory: ID) {
    swaprFactory(id: $factory, block: { number: $block }) {
      totalLiquidityUSD
    }
  }
`;

async function getTvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: this.chain,
  });
  const { swaprFactory } = await request(graphUrl[this.chain], graphQuery, {
    block,
    factory: factoryAddress[this.chain],
  });
  return toUSDTBalances(Number(swaprFactory.totalLiquidityUSD));
}

async function tvl(timestamp) {
  const balances = await Promise.all([
    getTvl.call({ chain: "ethereum" }, timestamp),
    getTvl.call({ chain: "xdai" }, timestamp),
  ]);
  return {
    [usdtAddress]: balances
      .reduce(
        (tvl, balance) => tvl.plus(balance[usdtAddress]),
        new BigNumber(0)
      )
      .toFixed(0),
  };
}

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: getTvl.bind({ chain: "xdai" }),
  },
  ethereum: {
    tvl: getTvl.bind({ chain: "ethereum" }),
  },
  tvl,
  name: "Swapr",
  category: "dexes",
};
