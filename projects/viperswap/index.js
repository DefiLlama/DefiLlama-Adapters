const ADDRESSES = require('../helper/coreAssets.json')

const viper = ADDRESSES.harmony.VIPER;
const xviper = "0xe064a68994e9380250cfee3e8c0e2ac5c0924548";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'harmony': '0x7d02c116b98d0965ba7b642ace0183ad8b8d2196'
}, { staking: { harmony: [xviper, viper] },  
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],})