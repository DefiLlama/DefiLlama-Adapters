const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports2, methodology, } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");

const cetheEquivalent=ADDRESSES.wan.WWAN
const tvlV1 = compoundExports2(  { comptroller: '0x21c72522005ccf570f40acaa04b448918aecc2ad', cether: '0xE8548014f731194764AF27C8edc9bbAA7d2f4C46', cetheEquivalent})
const tvlV2 = compoundExports2(  { comptroller: '0xd6980C52C20Fb106e54cC6c8AE04c089C3F6B9d6', cether: '0x48c42529c4c8e3d10060e04240e9ec6cd0eb1218', cetheEquivalent})
delete tvlV1.borrowed

module.exports = mergeExports([{
  methodology,
   wan: tvlV1,
}, { wan: tvlV2}])
