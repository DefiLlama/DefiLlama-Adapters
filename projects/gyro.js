const ADDRESSES = require('./helper/coreAssets.json')
const { ohmTvl } = require('./helper/ohm')

module.exports=ohmTvl("0x8B1522402FECe066d83E0F6C97024248Be3C8c01", [
    [ADDRESSES.bsc.USDT, false],
    [ADDRESSES.bsc.BUSD, false],
    ["0x5ca063a7e2bebefeb2bdea42158f5b825f0f9ffb", true],
    ["0xa5399084a5f06d308c4527517bbb781c4dce887c", true]
], "bsc", "0xe9c178cfdfeb917a46429714e5d51f6d4f296b75", "0x1b239abe619e74232c827fbe5e49a4c072bd869d")
module.exports.bsc.tvl = () => 0