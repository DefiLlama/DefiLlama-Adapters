const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const {stakingPricedLP} = require('../helper/staking')

const factory = '0xA01C3d760738c79e10334408aE59684Aa36B1131'

module.exports = {
  fantom:{
    tvl: uniTvlExport(factory, 'fantom'),
    staking: stakingPricedLP("0x72A7A3770B4BC999026F3663F1534581E0c59f2a", "0xd948efcc99be419ca9bdace89b2bec31edf13adb", 'fantom', "0x1758d21f2915583f49cc2b3e583df3e55f0dd2c0", "fantom")
  },
}
