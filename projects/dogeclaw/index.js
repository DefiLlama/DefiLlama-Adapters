const { masterchefExports, } = require('../helper/unknownTokens')

const chain = 'okexchain'
const contract = '0x1bb44D416620902a7f8AdF521422751A9f86d213'
const claw = '0xc2f1a8570361DAA6994936d1Dd397e1434F2E2B3'

module.exports = masterchefExports({ chain, masterchef: contract, nativeToken: claw, 
  useDefaultCoreAssets: true,})
