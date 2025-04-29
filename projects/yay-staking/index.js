const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: [
    ['0x7122985656e38bdc0302db86685bb972b145bd3c', '0xe86142af1321eaac4270422081c1EdA31eEcFf0c'], // stone
    ['0xe1b4d34e8754600962cd944b535180bd758e6c2e', '0x0341d2c2CE65B62aF8887E905245B8CfEA2a3b97'],  // eth
  ],
  soneium: [
    [ADDRESSES.soneium.ASTAR, '0xc8809C9f811324F4c196eb44C20555D4663Aa6c0'], // astar
    [ADDRESSES.soneium.vASTR, '0xea7Cf5C2D2509f7A4281F6E8378eaC30420f4206'], // vastar
    ['0xc67476893C166c537afd9bc6bc87b3f228b44337', '0xfAb6822ABaBC3987921f2F37B5E793A40E74aDfB'], // nsASTR - YayStakingManager
  ]
}

module.exports = {
  start: '2024-08-01',
}

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners })
  }
})
