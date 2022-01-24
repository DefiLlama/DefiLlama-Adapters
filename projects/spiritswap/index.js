const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')
const {staking} = require('../helper/staking')

const factory = '0xEF45d134b73241eDa7703fa787148D9C9F4950b0'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 3795376, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
    staking: staking("0x2fbff41a9efaeae77538bd63f1ea489494acdc08", "0x5cc61a78f164885776aa610fb0fe1257df78e59b", 'fantom')
  },
}