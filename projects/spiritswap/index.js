const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')

const factory = '0xEF45d134b73241eDa7703fa787148D9C9F4950b0'
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