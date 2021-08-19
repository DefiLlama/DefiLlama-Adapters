const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')

const factory = '0x733A9D1585f2d14c77b49d39BC7d7dd14CdA4aa5'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 6725911, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
  },
  tvl
}