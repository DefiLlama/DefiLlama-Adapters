// projects/pumpspace/index.js
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const { getTridentTVL } = require('../helper/sushi-trident')
const sdk = require('@defillama/sdk')

const CHAIN = 'avax'

// --- FACTORIES / CONTRACTS ---
const LEGACY_PUMPSPACE_V2_FACTORY   = '0x26B42c208D8a9d8737A2E5c9C57F4481484d4616' // V2
const ALLBLUE_V3_FACTORY        = '0xE749c1cA2EA4f930d1283ad780AdE28625037CeD' // V3/Trident
const ALLBLUE_V2_FACTORY   = '0x6FEa5651FaC99b854A961dbB41380AdB9F8F9a8b' // V2

// If you later expose staking for other MasterChefs, add here
// Legacy PumpSpace MasterChefs
const LEGACY_MASTERCHEFS = [
  '0x40a58fc672F7878F068bD8ED234a47458Ec33879', // SHELL
  '0x56b54a1384d35C63cD95b39eDe9339fEf7df3E42', // KRILL
  '0x06C551B19239fE6a425b3c45Eb8b49d28e8283C6', // PEARL
]

// Current AllBlue MasterChefs
const ALLBLUE_MASTERCHEFS = [
  '0xc5101878e56F10A2f5106cA301ADA3Ad0b6A894c', // SHELL
  '0x3cEC4339b50f62bADFF78e6A05E8558f66a34883', // PEARL
]

const MASTERCHEFS = [
  ...LEGACY_MASTERCHEFS,
  ...ALLBLUE_MASTERCHEFS,
]

// --- TOKENS (project/local wrappers + protocol tokens) ---
const TOKENS = {
  SHELL: '0xaD4CB79293322c07973ee83Aed5DF66A53214dc6',
  SBWPM: '0x6c960648d5F16f9e12895C28655cc6Dd73B660f7',
  SADOL: '0x6214D13725d458890a8EF39ECB2578BdfCd82170',
  KRILL: '0x4ED0A710a825B9FcD59384335836b18C75A34270',
  PEARL: '0x08c4b51e6Ca9Eb89C255F0a5ab8aFD721420e447',
}


module.exports = {
  misrepresentedTokens: true,
  methodology: `
  TVL is computed by summing liquidity reserves across the legacy PumpSpace V2 deployment, the current AllBlue V2 deployment, and AllBlue V3 (Trident) on Avalanche.
  Legacy PumpSpace contracts remain included as part of the migration to AllBlue.
  The staking bucket includes supported tokens deposited in both legacy PumpSpace and current AllBlue MasterChef contracts.
  `,
    avax: {
    tvl: sdk.util.sumChainTvls([
      // v2FactoryTVL, 
      // v3FactoryTVL,
      getUniTVL({ factory: LEGACY_PUMPSPACE_V2_FACTORY, useDefaultCoreAssets: true }),
      getUniTVL({ factory: ALLBLUE_V2_FACTORY,useDefaultCoreAssets: true }),
      getTridentTVL({ chain: CHAIN, factory:ALLBLUE_V3_FACTORY }),
    ]),
    staking: staking(
      MASTERCHEFS, 
      [TOKENS.SHELL, TOKENS.SBWPM, TOKENS.SADOL, TOKENS.KRILL, TOKENS.PEARL]
    )
  },
}
