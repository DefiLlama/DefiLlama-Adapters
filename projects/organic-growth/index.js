const { request, gql } = require("graphql-request");

const query = gql`
query Tokens {
  tokens {
    price
    poolAddress
    address
  }
}
`

const FACTOR = 1_000_000_000_000_000_000
const ogEndpoint = "https://long-gamma-labs.squids.live/organicgrowth-mainnet-squid/graphql"
async function tvl(api) {
  const response = await request(ogEndpoint, query)
  const prices = {}
  const calls = []
  for (const token of response["tokens"]) {
    prices[token["address"]] = Number(token["price"])
    calls.push({ target: token["address"], params: token["poolAddress"]})
  }
  const poolTokens = await api.multiCall({
    calls,
    abi: 'erc20:balanceOf',
  })
  let poolsSum = 0
  for (let i = 0; i < calls.length; i++) {
    poolsSum += prices[calls[i].target] * Number(poolTokens[i]) / FACTOR
  }

  const wxtz = await api.call({
    abi: "uint256:totalSupply",
    target: "0x3571aeD54CCEA5B69B00516D5A149A6BAeA77118",
  }) / FACTOR;

  return {
    'tezos':  wxtz + poolsSum,
  }
}

module.exports = {
  etlk: {
    tvl
  }
}