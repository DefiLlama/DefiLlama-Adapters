const {calculateUniTvl} = require('../helper/calculateUniTvl.js');
const { staking } = require("../helper/staking.js");

const DINO_TOKEN = '0xf317932ee2c30fa5d0e14416775977801734812d'
const MASTER_DINO = '0x26CB55795Cff07Df3a1Fa9Ad0f51d6866a80943b'
const FACTORY_DINO = "0x35E9455c410EacD6B4Dc1D0ca3144031f6251Dc2";

async function bscTvl(timestamp, block, chainBlocks) {
  var rs = calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', FACTORY_DINO, 0, true);
  return rs;
}

module.exports = {
  bsc:{
    tvl: bscTvl,
    staking: staking(MASTER_DINO, DINO_TOKEN, "bsc")
  },
}