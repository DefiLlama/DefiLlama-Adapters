const sdk = require("@defillama/sdk")
const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')
const assetsAbi = require("./abi")
const asssetsContract = "0xF6Eb0eE167e3b8a43E74999C47720140A9431448"

const chain = "arbitrum"

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks[chain];
  const { output: toa } = await sdk.api.abi.call({
    target: asssetsContract,
    abi: assetsAbi.getAssets,
    chain, block,
  })
  return sumTokens2({ chain: chain, block, tokensAndOwners: toa, })
}

module.exports = {
  arbitrum:{
    tvl,
    staking: staking(
      "0x7fbdEb84D5966c1C325D8CB2E01593D74c9A41Cd", //vetoken
      "0x09090e22118b375f2c7b95420c04414E4bf68e1A", //bela
      "arbitrum"
    ),
  },
};
