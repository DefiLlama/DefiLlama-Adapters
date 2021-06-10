const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')

const factory = '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 3795376, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
  },
  tvl
}