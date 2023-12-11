const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')


async function tvl(timestamp, block, chainBlocks , { api }) {
  // Get number of minted stACME
  const stacme = await sdk.api.abi.call({
    target: '0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547',
    abi: 'uint256:totalSupply',
    chain: api.chain
  })
  return { [ADDRESSES.ethereum.WACME]: stacme.output }
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


[
  "ethereum",
  "arbitrum"
].forEach((chain) => {
  if (!module.exports[chain]) module.exports[chain] = {};
  module.exports[chain].tvl = tvl;
});
