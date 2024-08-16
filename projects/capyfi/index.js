const { usdCompoundExports } = require('../helper/compound')

const capyfiConfig = {
  comptroller: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060',
  chain: 'lac',
  nativeTokenMarket: '0x465ebFCeB3953e2922B686F2B4006173664D16cE',
  options: { blacklist: ['0x25f38518dc45f6b20f716e508b8f468c97b2d4a9'] } 
}

const capyfiTVL = usdCompoundExports(
    capyfiConfig.comptroller,
    capyfiConfig.chain,
    capyfiConfig.nativeTokenMarket,
    undefined,
    capyfiConfig.options  
)


module.exports = {
  methodology: 'The TVL is calculated by adding the value of total deposits in all markets minus the total borrows.',
  lac: { ...capyfiTVL }
}
