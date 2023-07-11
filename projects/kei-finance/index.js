const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { request,  } = require("graphql-request");
const { BigNumber } = require("bignumber.js");

const TOKEN_ADDRESS = "0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3";
const TREASURY_ADDRESS = "0x3D027824a9Eb4cc5E8f24D97FD8495eA9DC7026F";
const WETH_ADDRESS = ADDRESSES.ethereum.WETH;

const config = {
  ethereum: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/kei-finance/core',
  }
}

const graphQuery = `
  query GetStakingDetails {
    staking(id:"staking") {
      totalPrincipal
      totalRewards
    }
  }
`;

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: () => 0,
    /* staking: async () => {
      const {  staking } = await request(
        config.ethereum.subgraph,
        graphQuery
      )

      return { [TOKEN_ADDRESS]: BigNumber(staking.totalPrincipal).plus(BigNumber(staking.totalRewards)) };
    }, */
  }
};
