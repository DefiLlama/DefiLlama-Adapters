const {compoundExports, compoundExportsWithAsyncTransform} = require('../helper/compound')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

module.exports={
    hallmarks: [
    ],
    celo:compoundExports("0x9BD4Fd10b531ae07437676dfE3FA6f505032CB64", "celo", "0x9de4171EDc1F69EAD07f7595bD3beD62d9215532", "0x471EcE3750Da237f93B8E339c536989b8978a438"),
    meter:compoundExports("0xcc0BfaD4e684023B18e0adfEcaEDd800D91dc8B5", "meter", "0xbF5cffE28d3CbA3376Cd02fF12eBECa43Bc3f14A", "0x160361ce13ec33C993b5cCA8f62B6864943eb083"),
    bsc:compoundExports("0x0E00Ae24B84148ee93Ce2Cf4F52dE277C91B0B72", "bsc", "0x9437Ea5b08AC7f9dc553861dfE1AA77EE0F2aE69", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"),
}