const sdk = require('@defillama/sdk')
const { calLyfTvl } = require("./lyf");
const { calAusdTvl } = require('./ausd');
const { calxALPACAtvl } = require('./xalpaca');
const aExports = require('../alpaca-finance-lend');

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
    tvl: sdk.util.sumChainTvls([bscTvl, aExports.bsc.tvl]),
    staking: bscStaking,
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([fantomTvl, aExports.fantom.tvl]),
    staking: ftmStaking,
  }
};
