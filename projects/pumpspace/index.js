// projects/pumpspace/index.js
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const { getTridentTVL } = require('../helper/sushi-trident')
const sdk = require('@defillama/sdk')

const CHAIN = 'avax'

// --- FACTORIES / CONTRACTS ---
const PUMP_FACTORY   = '0x26B42c208D8a9d8737A2E5c9C57F4481484d4616' // V2
const PUMP_V3        = '0xE749c1cA2EA4f930d1283ad780AdE28625037CeD' // V3/Trident

// If you later expose staking for other MasterChefs, add here
const MASTERCHEFS = [
  '0x40a58fc672F7878F068bD8ED234a47458Ec33879', // SHELL
  '0x56b54a1384d35C63cD95b39eDe9339fEf7df3E42', // KRILL
  '0x06C551B19239fE6a425b3c45Eb8b49d28e8283C6', // PEARL
]

// --- TOKENS (project/local wrappers + protocol tokens) ---
const TOKENS = {
  SHELL: '0xaD4CB79293322c07973ee83Aed5DF66A53214dc6',
}


module.exports = {
  misrepresentedTokens: true,
  methodology: `
  TVL is computed by summing reserves across PumpSpace V2 and V3 (Trident) factories on Avalanche.
  Single-asset staking (if enabled) reflects tokens deposited in the respective MasterChef contracts.
  `,
    avax: {
    tvl: sdk.util.sumChainTvls([
      // v2FactoryTVL, 
      // v3FactoryTVL,
      getUniTVL({ factory: PUMP_FACTORY, useDefaultCoreAssets: true }), 
      getTridentTVL({ chain: CHAIN, factory:PUMP_V3 }),
    ]),
    staking: sdk.util.sumChainTvls([
      // If you later add KRILL/PEARL single-asset staking, append similar lines here.
      staking([MASTERCHEFS[0]], [TOKENS.SHELL]),
    ])
  },
}
