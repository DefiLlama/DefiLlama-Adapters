const sdk = require('@defillama/sdk');
const config = require('./config.json');
const { call } = require('@defillama/sdk/build/abi');
const BigNumber = require("bignumber.js");


const chains = {
  'ethereum': 1,
  'arbitrum': 42161,
  // 'velas': 106
};


async function getLsdPoolsTvl(timestamp, block, chainBlocks, { api }) {
  const chainId = chains[api.chain];

  const balances = {};

  const calls = []

  const filteredLsdPools = config.lsdPools.filter(item => item.chainID === chainId);
  filteredLsdPools.forEach((pool) => {
    calls.push({
      target: pool.stAddress
    })
  })


  const balanceOfResults = await sdk.api.abi.multiCall({
    abi: 'uint256:totalSupply',
    chain: api.chain,
    calls
  });
  balanceOfResults.output.forEach((balanceOf) => {
    balances[filteredLsdPools.filter(item => item.stAddress === balanceOf.input.target)[0].baseToken] = balanceOf.output;
  });
  return balances;

}

// module.exports = {
//   // hallmarks: [
//   //   [1610496000, "Start of incentives for curve pool"],
//   //   [1651881600,"UST depeg"],
//   //   [1667865600, "FTX collapse"],
//   //   [1684108800, "ETH Withdrawal Activation"]
//   // ],
//   methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued, stMATIC is counted as Ethereum TVL since MATIC is staked in Ethereum and the liquidity token is also issued on Ethereum',
//   // timetravel: false, // solana
//   // doublecounted: true,
// }


Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: getLsdPoolsTvl
  }
});



