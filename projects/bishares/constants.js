const { request, gql } = require("graphql-request");

const GRAPH_URL_FUNDS_BSC = "https://api.thegraph.com/subgraphs/name/toffick/bisharesfunds";
const GRAPH_URL_FUNDS_FANTOM = "https://api.thegraph.com/subgraphs/name/toffick/bisharesfunds-fantom";
const GRAPH_URL_ARBEX_BSC = "https://api.thegraph.com/subgraphs/name/toffick/bisharesarbex";

const BNB_BISON_APESWAP_PAIR_ADDRESS = '0xec1214ee197304c17eb9e427e246a4fd37ba718e'; // BSC
const BNB_BISON_PANCAKESWAP_PAIR_ADDRESS = '0xe5da89fc07cbd30bfc92e14bdbe4c6156d309d12'; // BSC
const BNB_BISON_SPIRITSWAP_PAIR_ADDRESS = '0x73b8b0aa08b82d4028e255fd22977b446847c504'; // FANTOM

const CHAINS = {
  FANTOM: 'fantom',
  BSC: 'bsc'
}

const STABLEСOINS_DECIMALS_BY_CHAIN = {
  [CHAINS.BSC]: 18,
  [CHAINS.FANTOM]: 6,
}

const STABLEСOINS_ADDRESSES = {
  [CHAINS.BSC]: '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  [CHAINS.FANTOM]: '0x04068da6c83afcfa0e13ba15a6696662335d5b75' // USDC
}

// TODO change with block
const fundsTvlQuery = gql`
query getPools($block: Int) {
  indexPools(
    first:100 
  ) {
    name
    totalValueLockedUSD
  }
}
`;

// TODO change with block
const arbexTotalUSDLiquidity = gql`
query getArbexLiquidity($block: Int) {
  arbExFactories(
    first:100 
  ) {
    totalLiquidityUSD
  }
}
`;

module.exports = {
  GRAPH_URL_FUNDS_BSC,
  GRAPH_URL_FUNDS_FANTOM,
  GRAPH_URL_ARBEX_BSC,
  STABLEСOINS_DECIMALS_BY_CHAIN,
  STABLEСOINS_ADDRESSES,
  CHAINS,
  BNB_BISON_APESWAP_PAIR_ADDRESS,
  BNB_BISON_PANCAKESWAP_PAIR_ADDRESS,
  BNB_BISON_SPIRITSWAP_PAIR_ADDRESS,
  fundsTvlQuery,
  arbexTotalUSDLiquidity,
}