const { request, gql } = require("graphql-request");

const KCC_BLOCK_GRAPH =
  "https://thegraph.kcc.network/subgraphs/name/kcc-blocks";

const MJT_GRAPH = "https://thegraph.kcc.network/subgraphs/name/mojito/swap";

const BUNDLE_ID = "1";

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`;

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

const ETH_PRICE = (block) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `;

  return gql`
    ${queryString}
  `;
};

const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${
        block ? `block : {number: ${block}}` : ``
      } where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pairs(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `;

  return gql`
    ${queryString}
  `;
};

module.exports = {
  KCC_BLOCK_GRAPH,
  MJT_GRAPH,
  TOKEN_DATA,
  ETH_PRICE,
  GET_BLOCK,
};
