const ADDRESSES = require('../../../helper/coreAssets.json')
const auroraPools = [
  {
    id: 'carbon-carbon-near',
    name: 'CARBON-NEAR LP 🔥',
    token: 'CARBON-NEAR LP 🔥',
    tokenDescription: 'carbon-fi.net - CARBON-NEAR LP AC Auto Burn Vault 🔥',
    tokenAddress: '0x98Cf148cdC3E6d546D30717cE034C365ba204A4F',
    tokenDecimals: 18,
    tokenDescriptionUrl: '#',
    earnedToken: 'MagikFarm - CARBON-NEAR LP',
    earnedTokenAddress: '0xf81176796308D1154bb6Ed3D0Ca8e07a1E283600',
    earnContractAddress: '0xf81176796308D1154bb6Ed3D0Ca8e07a1E283600',
    pricePerFullShare: 1,
    tvl: 0,
    oracle: 'lps',
    oracleId: 'carbon-carbon-near',
    oraclePrice: 0,
    depositsPaused: false,
    status: 'active',
    platform: 'Carbon',
    assets: ['CARBON', 'NEAR'],
    risks: [
      'COMPLEXITY_LOW',
      'BATTLE_TESTED',
      'IL_HIGH',
      'MCAP_MEDIUM',
      'AUDIT',
      'CONTRACTS_VERIFIED',
    ],
    stratType: 'StratLP',
    buyTokenUrl:
      'https://www.trisolaris.io/#/swap?inputCurrency=0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d&outputCurrency=0x33ADf08ae486bf89ABc9634f6623A997FFDB66e7',
    addLiquidityUrl:
      'https://www.trisolaris.io/#/add/0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d/0x33ADf08ae486bf89ABc9634f6623A997FFDB66e7',
  },
];

module.exports = auroraPools;
