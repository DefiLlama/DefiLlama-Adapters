const abi = require('./abi')
const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');

const polygonVault = "0x32848E2d3aeCFA7364595609FB050A301050A6B4";
const polygonStaking = "0xE8e2E78D8cA52f238CAf69f020fA961f8A7632e9"; // Staked MVX, sMVX
const polygonMVX = "0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7";
const polygonMvxVester = "0x543e07eb4a260e10310fbcf2403e97c762a8db0b" // New Vester

const polygonTVL = async (api) => {
  const tokens = await api.fetchList({  lengthAbi: abi.allWhitelistedTokensLength, itemAbi: abi.allWhitelistedTokens, target: polygonVault})
  return api.sumTokens({ tokens, owner: polygonVault })
};

async function getStaking(timestamp, block) {
  const toa = [
    [polygonMVX, polygonStaking,],
    [polygonMVX, polygonMvxVester,],
  ]

  return sumTokens2({ tokensAndOwners: toa, block, chain: "polygon" })
}

module.exports = {
  polygon: {
    staking: getStaking,
    tvl: polygonTVL,
  },
};