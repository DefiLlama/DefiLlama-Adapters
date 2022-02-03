const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')
const {staking, stakingPricedLP} = require('../helper/staking')

const factory = '0xA01C3d760738c79e10334408aE59684Aa36B1131'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 3795376, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
    staking: stakingPricedLP("0x72A7A3770B4BC999026F3663F1534581E0c59f2a", "0xd948efcc99be419ca9bdace89b2bec31edf13adb", 'fantom', "0x1758d21f2915583f49cc2b3e583df3e55f0dd2c0", "fantom")
  },
}
