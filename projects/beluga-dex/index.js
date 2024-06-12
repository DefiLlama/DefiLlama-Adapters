const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')
const asssetsContract = "0xF6Eb0eE167e3b8a43E74999C47720140A9431448"

async function tvl(api) {
  const tokensAndOwners  = await api.call({
    target: asssetsContract,
    abi: "function getAssets() view returns (address[][])",
  })
  return sumTokens2({ api, tokensAndOwners, })
}

module.exports = {
  arbitrum:{
    tvl,
    staking: staking(
      "0x7fbdEb84D5966c1C325D8CB2E01593D74c9A41Cd", //vetoken
      "0x09090e22118b375f2c7b95420c04414E4bf68e1A", //bela
    ),
  },
};
