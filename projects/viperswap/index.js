const viper = '0xea589e93ff18b1a1f1e9bac7ef3e86ab62addc79';
const xviper = "0xe064a68994e9380250cfee3e8c0e2ac5c0924548";

const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'harmony': '0x7d02c116b98d0965ba7b642ace0183ad8b8d2196'
}, { staking: { harmony: [xviper, viper] },  
  hallmarks:[
    ['2022-06-23', "Horizon bridge Hack $100m"],
  ],})