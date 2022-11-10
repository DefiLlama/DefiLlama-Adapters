const { request, gql } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getBlock } = require('../helper/getBlock')

const graphUrl =
  "https://api.thegraph.com/subgraphs/name/alwaysbegrowing/arbor-v1";

// Get a list of collateral from active bonds at the given block number.
const graphQuery = (block) => gql`
  {
    bonds(where: { state: active }, block: { number: ${block} }) {
      id
      collateralToken {
        id
      }
    }
  }
`

async function tvl(timestamp, block, cb) {
  block = await getBlock(timestamp, 'ethereum', cb)
  const { bonds } = await request(graphUrl, graphQuery(block - 500), {});
  const toa = bonds.map(i => ([i.collateralToken.id, i.id])).filter(i => i[0] && i[1])
  return sumTokens2({ block, tokensAndOwners: toa})
}

module.exports = {
  methodology: "Sum the collateral value of active Arbor Finance bonds.",
  start: 14906553,
  ethereum: {
    tvl,
  },
};
