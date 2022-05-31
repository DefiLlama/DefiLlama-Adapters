const {  gql } = require("graphql-request");

const KCC_BLOCK_GRAPH =
  "https://thegraph.kcc.network/subgraphs/name/kcc-blocks";

const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;


module.exports = {
  KCC_BLOCK_GRAPH,
  GET_BLOCK,
};
