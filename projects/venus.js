const { compoundExports2} = require('./helper/compound');

module.exports.bsc = compoundExports2({ comptroller: '0xfd36e2c2a6789db23113685031d7f16329158384', cether: '0xA07c5b74C9B40447a954e1466938b865b6BBea36'})
module.exports.ethereum = compoundExports2({ comptroller: '0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796'})
module.exports.op_bnb = compoundExports2({ comptroller: '0xd6e3e2a1d8d95cae355d15b3b9f8e5c2511874dd'})
module.exports.arbitrum = compoundExports2({ comptroller: '0x317c1A5739F39046E20b08ac9BeEa3f10fD43326'})
module.exports.era = compoundExports2({ comptroller: '0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1'})