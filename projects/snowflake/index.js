const sdk = require("@defillama/sdk")
const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')
const assetsAbi = require("./abi")
const asssetsContract = "0x2c326AbbE089B786E7170da84e39F3d0c6650653"
const bscAsssetsContract = "0xEaEC4e680F5D534772e888fbD558b3b29e1F2E89"

const chain = "polygon"
const chain2 = "bsc"

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks[chain];
  const { output: toa } = await sdk.api.abi.call({
    target: asssetsContract,
    abi: assetsAbi.getAssets,
    chain, block,
  })
  return sumTokens2({ chain: chain, block, tokensAndOwners: toa, })
}

async function bscTvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks[chain2];
  const { output: toa } = await sdk.api.abi.call({
    target: bscAsssetsContract,
    abi: assetsAbi.getAssets,
    chain: chain2, block,
  })
  return sumTokens2({ chain: chain2, block, tokensAndOwners: toa, })
}

module.exports = {
  hallmarks: [
    [1672448400,"Rug Pull"]
  ],
  polygon:{
    tvl,
    staking: staking(
      "0xfD5D4caDe98366d0b09c03cB3cEe7D244c8b6146", //ve
      "0xE0f463832295ADf63eB6CA053413a3f9cd8bf685", //snow
      "polygon"
    ),
  },

  bsc: {
    tvl: bscTvl, 
    staking: staking(
      "0xfD5D4caDe98366d0b09c03cB3cEe7D244c8b6146", //ve
      "0xE0f463832295ADf63eB6CA053413a3f9cd8bf685", //snow
      "bsc"
    ),
  }
};
