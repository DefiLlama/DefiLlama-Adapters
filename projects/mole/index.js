const { calLyfTvl } = require("./lyf");
const { calxMOLEtvl } = require('./xmole');


async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  const lyfTvl = await calLyfTvl('avax', chainBlocks.avax);
  return {...lyfTvl};
}

async function avaxStaking(timestamp, ethBlock, chainBlocks) {
  return await calxMOLEtvl('avax', chainBlocks.avax);
}


// node test.js projects/mole/index.js
module.exports = {
  start: 1653840000,
  avax: {
    tvl: avaxTvl,
    staking: avaxStaking,
  }
};
