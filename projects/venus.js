const { compoundExports2} = require('./helper/compound');

module.exports.bsc = compoundExports2({ comptroller: '0xfd36e2c2a6789db23113685031d7f16329158384', cether: '0xA07c5b74C9B40447a954e1466938b865b6BBea36'})
module.exports.ethereum = compoundExports2({ comptroller: '0x687a01ecF6d3907658f7A7c714749fAC32336D1B'})
module.exports.op_bnb = compoundExports2({ comptroller: '0xd6e3e2a1d8d95cae355d15b3b9f8e5c2511874dd'})
module.exports.arbitrum = compoundExports2({ comptroller: '0x317c1A5739F39046E20b08ac9BeEa3f10fD43326'})
module.exports.era = compoundExports2({ comptroller: '0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1'})
module.exports.base = compoundExports2({ comptroller: '0x0C7973F9598AA62f9e03B94E92C967fD5437426C'})
module.exports.optimism = compoundExports2({ comptroller: '0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC'})
module.exports.unichain = compoundExports2({ comptroller: '0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe'})