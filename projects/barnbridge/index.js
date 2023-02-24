const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const CHAINS = [
  {
    id: 1,
    name: "ethereum",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/bb-sy-mainnet",
    address: "0x8A897a3b2dd6756fF7c17E5cc560367a127CA11F",
  },
  {
    id: 42161,
    name: "arbitrum",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/bb-sy-arbitrum",
    address: "0x1ADDAbB3fAc49fC458f2D7cC24f53e53b290d09e",
  },
];

const termsQuery = (timestamp) => gql`
    {
      terms(where: { end_gt: ${timestamp} }) {
        depositedAmount
      }
    }
  `;

const _underlying = async (chain, api) =>
  api.call({
    abi: "address:underlying",
    target: chain.address,
  })

const _liquidityProviderBalance = async (chain, api) =>
  api.call({
    abi: "uint256:liquidityProviderBalance",
    target: chain.address,
  })

const tvl = (chain) => {
  return async (timestamp, _1, _2, { api, }) => {
    const balances = {}
    const underlying = await _underlying(chain, api);
    const liquidity = await _liquidityProviderBalance(chain, api);

    const { terms } = await request(chain.url, termsQuery(timestamp));

    const deposits = terms.reduce((acc, term) => acc + +term.depositedAmount, 0);
    sdk.util.sumSingleBalance(balances, underlying, liquidity, api.chain)
    sdk.util.sumSingleBalance(balances, underlying, deposits, api.chain)

    return balances
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
