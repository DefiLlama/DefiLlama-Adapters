const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { staking } = require("../helper/staking");
const { sumTokens } = require('../helper/unwrapLPs')

// Polygon
const polygonVault = "0x32848E2d3aeCFA7364595609FB050A301050A6B4";
const polygonStaking = "0xE8e2E78D8cA52f238CAf69f020fA961f8A7632e9"; // Staked MVX, sMVX
const polygonMVX = "0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7";
const chain= 'polygon'

const polygonTVL = async (timestamp, _block, { [chain]: block}) => {
  const calls = []
  const { output: size } = await sdk.api.abi.call({
    target: polygonVault,
    abi: abi.allWhitelistedTokensLength,
    chain, block,
  })
  for (let i = 0;i < +size; i++)
    calls.push({params: i})
  const { output: tokens } = await sdk.api.abi.multiCall({
    target: polygonVault,
    abi: abi.allWhitelistedTokens,
    calls,
    chain, block,
  })
  const toa = tokens.map(i => [i.output, polygonVault])
  return sumTokens({}, toa, block, chain)
};

module.exports = {
  polygon: {
    staking: staking(polygonStaking, polygonMVX),
    tvl: polygonTVL,
  },
};