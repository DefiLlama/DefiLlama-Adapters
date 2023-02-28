const { calLyfTvl } = require("./lyf");
const { calAusdTvl } = require('./ausd');
const { calxALPACAtvl } = require('./xalpaca');
const { sumTokensExport } = require('../helper/unwrapLPs');
const Alperp = require('./alperp');

async function bscTvl(timestamp, ethBlock, chainBlocks) {
  const lyfTvl = await calLyfTvl('bsc', chainBlocks.bsc);
  const ausdTvl = await calAusdTvl('bsc', chainBlocks.bsc);
  return {...lyfTvl, ...ausdTvl};
}

async function bscStaking(timestamp, ethBlock, chainBlocks) {
  return await calxALPACAtvl('bsc', chainBlocks.bsc);
}

async function fantomTvl(timestamp, ethBlock, chainBlocks) {
  const lyfTvl = await calLyfTvl('fantom', chainBlocks.fantom);
  return {...lyfTvl};
}

async function ftmStaking(timestamp, ethBlock, chainBlocks) {
  return await calxALPACAtvl('fantom', chainBlocks.fantom);
}

// node test.js projects/alpaca-finance/index.js
module.exports = {
  start: 1602054167,
  bsc: {
    tvl: {
      ...bscTvl,
      ...sumTokensExport({
        owner: Alperp.POOL_DIAMOND_CONTRACT,
        tokens: Object.values(Alperp.tokens),
        chain: 'bsc',
      })
    },
    staking: bscStaking,
  },
  fantom: {
    tvl: fantomTvl,
    staking: ftmStaking,
  }
};
