const sdk = require("@defillama/sdk");
const { request,  } = require("graphql-request");
const { BigNumber } = require("bignumber.js");

const TOKEN_ADDRESS = "0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3";
const TREASURY_ADDRESS = "0x3D027824a9Eb4cc5E8f24D97FD8495eA9DC7026F";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

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

async function tvl(_, _1, _2, { api }) {
  // const tokenBalance = await sdk.api.erc20.balanceOf({
  //   target: TOKEN_ADDRESS,
  //   owner: TREASURY_ADDRESS
  // });

  const wethBalance = await sdk.api.erc20.balanceOf({
    target: WETH_ADDRESS,
    owner: TREASURY_ADDRESS
  });

  console.log(wethBalance)

  return {
    [WETH_ADDRESS]: wethBalance.output,
    // [TOKEN_ADDRESS]: tokenBalance.output
  };
}

module.exports = {
  ethereum: {
    tvl,
    staking: async () => {
      const {  staking } = await request(
        config.ethereum.subgraph,
        graphQuery
      )

      return { [TOKEN_ADDRESS]: BigNumber(staking.totalPrincipal).plus(BigNumber(staking.totalRewards)) };
    },
  }
};
