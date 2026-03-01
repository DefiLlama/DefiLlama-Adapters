const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// DAO Treasury address
const DAO_TREASURY = '0xaa68bc4bab9a63958466f49f5a58c54a412d4906'

// Token addresses
const TOKENS = {
  // From core assets
  WFLR: ADDRESSES.flare.WFLR,
  
  // Additional tokens (using raw addresses as they're not in coreAssets)
  SFLR: '0x12e605bc104e93B45e1aD99F9e555f659051c2BB',
  FXRP: '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE',
  STXRP: '0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3',
  CDP: '0x6Cd3a5Ba46FA254D4d2E3C2B37350ae337E94a0F'
}

// Main protocol addresses
const MAIN_CONTRACTS = [
  '0x194726F6C2aE988f1Ab5e1C943c17e591a6f6059', // FB Main
  '0x90679234FE693B39BFdf5642060Cb10571Adc59b'  // IBDP
]

// LP positions
const LP_CONTRACTS = [
  '0x5f29c8d049e47dd180c2b83e3560e8e271110335', // Enosys V2 LP
  '0x0f574fc895c1abf82aeff334fa9d8ba43f866111'  // SparkDex V2 LP
]

module.exports = {
  flare: {
    tvl: sumTokensExport({ 
      owners: [...MAIN_CONTRACTS, ...LP_CONTRACTS, DAO_TREASURY], 
      tokens: Object.values(TOKENS)
    })
  }
}