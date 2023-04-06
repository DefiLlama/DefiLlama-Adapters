const { getPastAndActiveTerms } = require("./subgraph.js");
const { totalValueLockedForTerms } = require("./numbers.js");

const CHAINS = [
  {
    id: 1,
    name: "ethereum",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/sy-mainnet",
    address: "0xc67cb09d08521cD1dE6BAAC46824261eb1dB8800",
  },
  {
    id: 42161,
    name: "arbitrum",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/sy-arbitrum",
    address: "0xf878a060D4d51704B14e8f68B51185bF5DbFE3A1",
  },
  {
    id: 10,
    name: "optimism",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/sy-optimism",
    address: "0x45c158E0ee76c76E525BaB941991268249e95331",
  },
];

const tvl = (chain) => {
  return async (_timestamp, _1, _2, _3) => {
    const pastAndActiveTerms = await getPastAndActiveTerms(chain.url);

    const tvls = await totalValueLockedForTerms(
      chain,
      pastAndActiveTerms,
      true
    );

    return Object.fromEntries(
      tvls.map(({ underlying, value }) => [
        `${chain.name}:${underlying}`,
        value,
      ])
    );
  };
};

module.exports = {
  timetravel: false,
  methodology:
    "BarnBridge TVL is an aggregated TVL (user liquidity + DAO deposits) of active Smart Yield pools across available networks.",
};

CHAINS.forEach((chain) => {
  module.exports[chain.name] = {
    tvl: tvl(chain),
  };
});
