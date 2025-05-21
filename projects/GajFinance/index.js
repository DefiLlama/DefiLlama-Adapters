const { sumTokens } = require('../helper/unwrapLPs');
const { masterChefExports } = require("../helper/masterchef");

const GAJ_TOKEN = '0xf4b0903774532aee5ee567c02aab681a81539e92'
const GAJ_AVAX_TOKEN = '0x595c8481c48894771CE8FaDE54ac6Bf59093F9E8'
const MASTER_GAJ = '0xb03f95e649724df6ba575c2c6ef062766a7fdb51'
const NFTFARM_GAJ_AVAX = '0x65096f7dB56fC27C7646f0aBb6F9bC0CEA2d8765'

async function stakingAvax(timestamp, ethBlock, chainBlocks) {
  return sumTokens({}, [[GAJ_AVAX_TOKEN, NFTFARM_GAJ_AVAX]], chainBlocks.avax, 'avax')
}

module.exports = {
  methodology: "TVL comes from NFT Farming, Jungle Pools, MasterChef and Vaults",
  avax:{
    staking: stakingAvax,
  },
  ...masterChefExports(MASTER_GAJ, 'polygon', GAJ_TOKEN),
}
