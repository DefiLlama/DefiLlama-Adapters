const { calLyfTvl } = require("./lyf");
const { calxMOLEtvl } = require('./xmole');


async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  const lyfTvl = await calLyfTvl('avax', chainBlocks.bsc);
  return {...lyfTvl};
}

async function avaxStaking(timestamp, ethBlock, chainBlocks) {
  return await calxMOLEtvl('avax', chainBlocks.bsc);
}


// node test.js projects/mole/index.js
module.exports = {
  start: 15388215,
  avax: {
    tvl: avaxTvl,
    staking: avaxStaking,
  }
};
