const { sumTokensExport, unknownTombs } = require("../helper/unknownTokens");

const token = "0xf989C34E5Dbf0e94a34CFf75A0fa3Abd05C23061";
const shares = "0x0Fa11B13c8CC9AEc2EdB3512f6F079Ad148c5955";
const shareRewardPool = "0xF70286B0FEfB0Eab29247B4DF1147505808Bc235";
const boardroom = "0x69f2afb54cd03b687d37110a5d67feA597F49a55";
const GenMasterchef = "0x9e387B3679cc55d993d5f001006aC94138ED462C";

const pool2LPs = [
  // token,  // ROSE
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
  tokens: ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8']
})