const { compoundExports2 } = require('../helper/compound')

module.exports.lac = compoundExports2({ comptroller: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060', cether: '0x465ebfceb3953e2922b686f2b4006173664d16ce'})
module.exports.ethereum = compoundExports2({ comptroller: '0x0b9af1fd73885aD52680A1aeAa7A3f17AC702afA', cether: '0x37DE57183491Fa9745d8Fa5DCd950f0c3a4645c9', blacklistedTokens: ['0xbaa6bc4e24686d710b9318b49b0bb16ec7c46bfa']})
module.exports.wc = compoundExports2({ comptroller: '0x589d63300976759a0fc74ea6fA7D951f581252D7', cether: '0xaAd91abe333c4536FFbF02b83daBaB49C9Aa23ed'})
