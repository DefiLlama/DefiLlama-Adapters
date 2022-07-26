
const { masterchefExports, } = require('../helper/unknownTokens')

const chain = 'okexchain'
const contract = '0x1bb44D416620902a7f8AdF521422751A9f86d213'
const claw = '0xc2f1a8570361DAA6994936d1Dd397e1434F2E2B3'

module.exports = masterchefExports({ chain, masterchef: contract, nativeToken: claw, coreAssets: [
  '0x382bb369d343125bfb2117af9c149795c6c65c50', // tether
  "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85", // usdc
  "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15", // wokt
],})
