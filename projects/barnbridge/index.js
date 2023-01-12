const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");

const ERC20 = require("./abis/ERC20.js");

const CHAINS = [
  {
    id: 1,
    name: "ethereum",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/bb-sy-mainnet",
    address: "0x8A897a3b2dd6756fF7c17E5cc560367a127CA11F",
    abi: require("./abis/SmartYieldaV2.js"),
  },
  {
    id: 42161,
    name: "arbitrum",
    url: "https://api.thegraph.com/subgraphs/name/barnbridge/bb-sy-arbitrum",
    address: "0x1ADDAbB3fAc49fC458f2D7cC24f53e53b290d09e",
    abi: require("./abis/SmartYieldaV3.js"),
  },
];

const termsQuery = (timestamp) => gql`
    {
      terms(where: { end_gt: ${timestamp} }) {
        depositedAmount
      }
    }
  `;

module.exports = {
  timetravel: false,
  methodology:
    "BarnBridge TVL is an aggregated TVL (user liquidity + DAO deposits) of active Smart Yield pools across available networks.",
};

const _underlying = async (chain) =>
  (
    await sdk.api.abi.call({
      abi: chain.abi.find((i) => i.name === "underlying"),
      chain: chain.name,
      target: chain.address,
    })
  ).output;

const _decimals = async (chain, target) =>
  (
    await sdk.api.abi.call({
      abi: ERC20.find((i) => i.name === "decimals"),
      chain: chain.name,
      target: target,
    })
  ).output;

const _symbol = async (chain, target) =>
  (
    await sdk.api.abi.call({
      abi: ERC20.find((i) => i.name === "symbol"),
      chain: chain.name,
      target: target,
    })
  ).output;

const _liquidityProviderBalance = async (chain) => {
  const balance = (
    await sdk.api.abi.call({
      abi: chain.abi.find((i) => i.name === "liquidityProviderBalance"),
      chain: chain.name,
      target: chain.address,
    })
  ).output;

  return BigNumber(balance);
};

const tvl = (chain) => {
  return async (timestamp, _1, _2, _3) => {
    const underlying = await _underlying(chain);
    const decimals = await _decimals(chain, underlying);
    const symbol = await _symbol(chain, underlying);
    const liquidity = await _liquidityProviderBalance(chain);

    const { terms } = await request(chain.url, termsQuery(timestamp));

    const deposits = terms.reduce(
      (acc, term) => acc.plus(BigNumber(term.depositedAmount)),
      BigNumber(0)
    );

    const total = deposits
      .div(`1e${decimals}`)
      .plus(liquidity.div(`1e${decimals}`));

    return { [symbol]: total };
  };
};

CHAINS.forEach((chain) => {
  module.exports[chain.name] = {
    tvl: tvl(chain),
  };
});
