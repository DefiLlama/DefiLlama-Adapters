const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, unknownTombs } = require("../helper/unknownTokens");

const token = "0x07D49375A3213eF25aAA47C97A2d23A754bB8f8a";
const shares = "0xe318140bF0A31EAAf401AD62801b6c7427b36773";
const shareRewardPool = "0x989128334442946ed6508C45C43758a4e1E14923";
const boardroom = "0x9d7BBFA16E80A9C4ce9ecf3B706166aEf1477cE1";
const GenMasterchef = "0x29dA4fF649d39510f633Cd804B860858C333E5aD";

const pool2LPs = [
  "0xE368148b5A3771211C96F950B7d4f0C7E5427C1D", // ROSE-ETH
  "0x0DB2Efc6c9A93eA22152ef410E3099f0cd67A599" // SHARE-WETH
]

module.exports = unknownTombs({
  token: [token],
  shares: [shares,],
  masonry: [boardroom,],
  rewardPool: [shareRewardPool,],
  chain: 'arbitrum',
  lps: pool2LPs,
  useDefaultCoreAssets: true,
})

module.exports.arbitrum.tvl = sumTokensExport({
  owner: GenMasterchef,
  tokens: [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC]
})
