const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')
const {staking} = require('../helper/staking')

const factory = '0xA01C3d760738c79e10334408aE59684Aa36B1131'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 3795376, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
    staking: staking("0xd948efcc99be419ca9bdace89b2bec31edf13adb", 'fantom')
  },
}
