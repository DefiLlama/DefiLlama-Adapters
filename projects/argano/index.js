const { request, gql } = require("graphql-request");

async function fetch() {
  const graphUrl =
  "https://api.thegraph.com/subgraphs/name/r312r0/vlad-ago-subgraph";

const graphQuery = gql`
  {
    uniswapFactory(id: "0xdac31e70c2c4fea0629e85e7b67222127a8672d8") {
      id
      totalValueLocked(first: 1, orderBy: timestamp, orderDirection: desc) {
        value
      }
    }
  }
`;

const { uniswapFactory } = await request(graphUrl, graphQuery);


const balance = Math.round(uniswapFactory.totalValueLocked[0].value)
  return balance;
}

module.exports = {
  fetch
}