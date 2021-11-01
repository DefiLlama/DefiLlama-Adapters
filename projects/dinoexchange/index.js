const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const DINO_TOKEN = '0xf317932ee2c30fa5d0e14416775977801734812d'
const MASTER_DINO = '0x26CB55795Cff07Df3a1Fa9Ad0f51d6866a80943b'
const FACTORY_DINO = "0x35E9455c410EacD6B4Dc1D0ca3144031f6251Dc2";

async function bscTvl(timestamp, block, chainBlocks) {
  var rs = calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', FACTORY_DINO, 0, true);
  return rs;
}

async function stakingTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const stakedDino = sdk.api.erc20.balanceOf({
    target: DINO_TOKEN,
    owner: MASTER_DINO,
    chain: 'bsc',
    block: chainBlocks.bsc
  })
  sdk.util.sumSingleBalance(balances, 'bsc:' + DINO_TOKEN, (await stakedDino).output)
  return balances
}


module.exports = {
  bsc:{
    tvl: bscTvl,
  },
  staking:{
    tvl: stakingTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl])
}