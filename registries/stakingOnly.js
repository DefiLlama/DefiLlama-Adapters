const { buildProtocolExports } = require('./utils')

function stakingOnlyExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    result[chain] = { tvl: () => ({}) }
  })
  return result
}

const configs = {
  // ============================================================
  // Simple staking/pool2-only adapters
  // ============================================================

  '2omb-finance': {
    fantom: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: [['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'bombmoney': {
    bsc: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'grape-finance': {
    avax: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'nacho-finance': {
    methodology: "Pool2 deposits consist of NACHO/ETH, NSHARE/MATIC LP, ETH/MATIC LP, ETH/USDC LP and NBOND tokens deposits while the staking TVL consists of the NSHARE tokens locked within the Bowl contract.",
    polygon: {
      staking: ['0x1ad667aCe03875fe48534c65BFE14191CF81fd64', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'],
      pool2: ['0xdD694F459645eb6EfAE934FE075403760eEb9aA1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'tempus': {
    ethereum: {
      staking: ['0x6C6D4753a1107585121599746c2E398cCbEa5119', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'],
    },
    fantom: {},
  },
  'solvr': {
    methodology: 'TVL is calculated as the total SOLVR tokens staked in the SolvrStaking contract on Base.',
    base: { 
      staking: ["0xde2dc52d8ac7b793a9558b7b13b7b24f5c3b983a", "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1"]
    }
  },
  'nickel': {
    methodology: 'TVL is NICKEL tokens held in GridMining (mined rewards) and Staking (user-staked NICKEL).',
    base: { 
      staking: { owners: ["0xEF35314a4F3a1F8CE89095202dABAeEe1CaAd760", "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1"], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']}
    }
  },
  'bitchemical': {
    methodology: 'Counts BCHEM held by the Bitchemical staking contract on BNB Chain.',
    bsc: {
      staking: ['0x01F82039810f18F703F4c8b943940ce04Fa00C78', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']
    }
  },
  'mineloot': {
    methodology: 'TVL is LOOT tokens held in GridMining (mined rewards), Staking (user-staked LOOT), and Lock (user-locked LOOT).',
    base: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']}
    }
  },
  'cronos-gangsters': {
    methodology: 'TVL counts GANG tokens locked in Cronos Gangsters staking and competition contracts.',
    cronos: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']}
    }
  },
  'reppo': {
    methodology: 'TVL is the total REPPO tokens locked in the VeREPPO contract.',
    base: {
      staking: { owners: ['0x0EFBE19Cb7B07D934D01990a8989E9CaA98b9009'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']}
    }
  },
  'nara': {
    methodology: 'TVL is the total NARA locked in NARAEngineV2. Users lock NARA for a chosen duration and earn NARA + ETH rewards every 15-minute epoch.',
    base: {
      staking: { owners: ['0x62250aEE40F37e2eb2cd300E5a429d7096C8868F'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']}
    }
  },
  'venice-protocol': {
    methodology: 'Counts the total VVV tokens locked in the Venice Protocol staking contract (sVVV) on Base.',
    base: {
      staking: ['0x321b7ff75154472B18EDb199033fF4D116F340Ff', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'citrea-staking': {
    methodology: 'Sum of CTR locked by users in the xCTR (Staked CTR) staking contract on Citrea, which grants governance voting power.',
    citrea: {
      staking: { owners: ['0x2015F35030A8Ff2C0CA161a865414996F8E80AA4'], tokens: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']},
    },
  },
  'tokamak-network': {
    methodology: 'TON staked through Tokamak Network seigniorage staking on Ethereum L1. Stakers delegate TON to operator (DAO candidate) contracts; the principal is custodied as WTON (27-decimal wrapped TON) in the DepositManager (0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e). Reported staking value is the DepositManager WTON balance.',
    ethereum: {
      staking: { owners: ['0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']},
    },
  },

  // ============================================================
  // Tomb forks (tombTvl, tokensOnCoingecko=true) - array staking + array pool2
  // ============================================================

  'snowyowl': {
    misrepresentedTokens: true,
    avax: {
      staking: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'dibs-money': {
    bsc: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'gaur': {
    cronos: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'frozen-walrus': {
    avax: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']],
    },
  },
  'emp-money': {
    misrepresentedTokens: true,
    bsc: {
      staking: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },

  // ============================================================
  // Tomb forks (tombTvl, tokensOnCoingecko=false) - object staking + array pool2
  // ============================================================

  'draco-finance': {
    fantom: {
      staking: { owners: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'athena-money': {
    deadFrom: '2026-01-19',
    misrepresentedTokens: true,
    moonriver: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'snowtomb': {
    misrepresentedTokens: true,
    avax: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']],
    },
  },
  'ampere': {
    methodology: "Pool2 deposits consist of AMP/FUSE and CURRENT/FUSE LP tokens deposits while the staking TVL consists of the CURRENT tokens locked within the Masonry contract, priced using Fuse on Ethereum mainnet.",
    start: 1650700800,
    fuse: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']],
    },
  },
  'thermes-finance': {
    fantom: {
      staking: { owners: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']],
    },
  },
  'rubik-finance': {
    fantom: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']],
    },
  },
  'ripae': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
    avax: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
    bsc: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
    polygon: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
    cronos: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
    arbitrum: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
    optimism: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'pulsemaxfinance': {
    misrepresentedTokens: true,
    pulse: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'polar-bear-finance': {
    avax: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'platinum-finance': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'peakmetis': {
    misrepresentedTokens: true,
    metis: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'magik-finance': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'icecream-finance': {
    avax: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'comet-finance': {
    fantom: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0xBAFDCFC3787BF7833BE6Be8E2D9e822B610255C9'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'code7': {
    fantom: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'amesdefi': {
    bsc: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'droplit-money': {
    misrepresentedTokens: true,
    bsc: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },

  // ============================================================
  // Tomb forks (unknownTombs) - object staking + array pool2
  // ============================================================

  'empyreal': {
    misrepresentedTokens: true,
    arbitrum: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'subzero-plus': {
    misrepresentedTokens: true,
    avax: {
      staking: { owners: ['0xa252FfDB3A73Bd0F88Eea39658c7C00a281B3bB6'], tokens: ['0xF5b1A0d66856CBF5627b0105714a7E8a89977349'], lps: ['0xD1D0340d80bee3c6f90116467a78dC3718121100', '0xbfE8B1f30035262903927F5BfD65319ef09B48B5', '0x763513C7e639A21D0a7d4A5ec60a6e7314Ed00C8'], useDefaultCoreAssets: true },
      pool2: ['0xDAccfd92e37be54Ca1A8ff37A7922446614b4759', ['0xD1D0340d80bee3c6f90116467a78dC3718121100', '0xbfE8B1f30035262903927F5BfD65319ef09B48B5', '0x763513C7e639A21D0a7d4A5ec60a6e7314Ed00C8']],
    },
  },
  'gametheory': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'dawn-star-finance': {
    misrepresentedTokens: true,
    polygon: {
      staking: { owners: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], tokens: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], lps: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], useDefaultCoreAssets: true },
      pool2: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE']],
    },
  },
  'cowaii-cash': {
    misrepresentedTokens: true,
    dogechain: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'ora-finance': {
    misrepresentedTokens: true,
    methodology: "Pool2 deposits consist of ORA/AURORA and OSHARE/AURORA LP tokens deposits while the staking TVL consists of the OSHARES tokens locked within the Boardroom.",
    aurora: {
      staking: { owners: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], tokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], lps: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x7939e155b222c804FCDd0d0297922BBEf6F64897'], useDefaultCoreAssets: true },
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1']],
    },
  },
  'akropolis': {
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'orbs': {
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'looks-rare': {
    methodology: 'TVL for LOOKS.RARE consists of the staking of LOOKS and pool2 of uni-v2 LOOKS-WETH.',
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'thegraph': {
    methodology: 'TVL counts GRT tokens deposited on the Staking contracts.',
    start: '2023-06-25',
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
    arbitrum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'ethfi-stake': {
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
    arbitrum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'epns': {
    methodology: 'TVL for PUSH consists of the staking of PUSH and pool2 of uni-v2 LP.',
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'fees-wtf': {
    methodology: 'TVL for fees.wtf consists of the staking of WTF and pool2 of uni-v2 WTF-WETH.',
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
      pool2: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'gracy-staking': {
    ethereum: {
      staking: [[
        '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
        '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
        '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
        '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
      ], '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
    base: {
      staking: [['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
  'heroes-of-mavia': {
    ethereum: {
      staking: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
    base: {
      staking: [['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'],
    },
  },
}

module.exports = buildProtocolExports(configs, stakingOnlyExportFn)
