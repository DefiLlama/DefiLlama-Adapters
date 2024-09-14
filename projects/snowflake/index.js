const { staking } = require("../helper/staking");
const assetsAbi = require("./abi")
const asssetsContract = "0x2c326AbbE089B786E7170da84e39F3d0c6650653"
const bscAsssetsContract = "0xEaEC4e680F5D534772e888fbD558b3b29e1F2E89"

async function tvl(api) {
  const tokensAndOwners = await api.call({ target: asssetsContract, abi: assetsAbi.getAssets, })
  return api.sumTokens({ tokensAndOwners })
}

async function bscTvl(api) {
  const tokensAndOwners = await api.call({ target: bscAsssetsContract, abi: assetsAbi.getAssets, })
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  hallmarks: [
    [1672448400, "Rug Pull"]
  ],
  // deadFrom: 1672448400,
  polygon: {
    tvl: () => ({}),
    staking: () => ({}),
  },

  bsc: {
    tvl: () => ({}),
    staking: () => ({}),
  }
};
