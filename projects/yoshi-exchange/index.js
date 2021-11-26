const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js');

const factory = '0xc5bc174cb6382fbab17771d05e6a918441deceea'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  return calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 19757372, true);
}

module.exports = {
  fantom:{
    tvl,
  },
}
