const { calLyfTvl, calLyfTvlAptos, calLyfTvlSui } = require("./lyf");
const { calxMOLEtvl } = require('./xmole');

// async function avaxTvl(timestamp, ethBlock, chainBlocks) {
//   const lyfTvl = await calLyfTvl('avax', chainBlocks.avax);
//   return {...lyfTvl};
// }

// async function avaxStaking(timestamp, ethBlock, chainBlocks) {
//   return await calxMOLEtvl('avax', chainBlocks.avax);
// }

async function aptosTvl() {
  const lyfTvl = await calLyfTvlAptos()
  return {...lyfTvl};
}

async function suiTvl() {
  const { api } = arguments[3]

  const lyfTvl = await calLyfTvlSui(api)
}

// run command： node test.js projects/mole/index.js
module.exports = {
  timetravel: false,
  start: '2022-05-29',
  // avax: {
  //   tvl: avaxTvl,
  //   staking: avaxStaking,
  // },
  aptos: {
    tvl: aptosTvl
  },
  sui: {
    tvl: suiTvl
  }
};
