const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require('../helper/compound')

module.exports = {
    hallmarks: [
    ],
    celo: compoundExports("0x9BD4Fd10b531ae07437676dfE3FA6f505032CB64", "0x9de4171EDc1F69EAD07f7595bD3beD62d9215532", ADDRESSES.celo.CELO),
    meter: compoundExports("0xcc0BfaD4e684023B18e0adfEcaEDd800D91dc8B5", "0xbF5cffE28d3CbA3376Cd02fF12eBECa43Bc3f14A", ADDRESSES.meter.WMTR),
    bsc: compoundExports("0x0E00Ae24B84148ee93Ce2Cf4F52dE277C91B0B72", "0x9437Ea5b08AC7f9dc553861dfE1AA77EE0F2aE69", ADDRESSES.bsc.WBNB),
}
module.exports.celo.borrowed = ()  => ({})
module.exports.meter.borrowed = ()  => ({})
module.exports.bsc.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 