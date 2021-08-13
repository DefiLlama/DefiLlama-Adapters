const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')

const factory = '0x6178C3B21F7cA1adD84c16AD35452c85a85F5df4'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 7280058, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
  },
  tvl
}
