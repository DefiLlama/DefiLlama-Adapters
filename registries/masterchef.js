const ADDRESSES = require('../projects/helper/coreAssets.json')
const { masterchefExports } = require('../projects/helper/unknownTokens')
const { masterChefExports } = require('../projects/helper/masterchef')
const { mergeExports } = require('../projects/helper/utils')
const { buildProtocolExports } = require('./utils')

const chainExportKeys = new Set(['staking', 'pool2', 'borrowed', 'vesting'])

function masterchefExportFn(chainConfigs, options = {}) {
  const result = {}
  const helperType = options.helperType || 'new'

  if (helperType === 'old') {
    result.methodology = 'TVL includes all farms in MasterChef contract'
  }

  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      // Simple string = masterchef address (new-style, no native token)
      const exports = masterchefExports({ chain, masterchef: config })
      result[chain] = exports[chain]
      return
    }

    // Handle array of configs (multiple masterchefs on same chain)
    if (Array.isArray(config)) {
      const exports = config.map(c => {
        const helperConfig = { ...c }
        for (const key of chainExportKeys) delete helperConfig[key]
        if (helperType === 'old') {
          const { masterchef, stakingToken, tokenIsOnCoingecko = true, poolInfoAbi, includeYVTokens } = helperConfig
          return masterChefExports(masterchef, chain, stakingToken, tokenIsOnCoingecko, poolInfoAbi, includeYVTokens)
        }
        return masterchefExports({ chain, ...helperConfig })
      })
      result[chain] = mergeExports(exports)[chain]
      return
    }

    // Strip chain export keys before passing to helper
    const helperConfig = { ...config }
    for (const key of chainExportKeys) delete helperConfig[key]

    if (helperType === 'old') {
      const {
        masterchef,
        stakingToken,
        tokenIsOnCoingecko = true,
        poolInfoAbi,
        includeYVTokens,
      } = helperConfig
      const exports = masterChefExports(masterchef, chain, stakingToken, tokenIsOnCoingecko, poolInfoAbi, includeYVTokens)
      result[chain] = exports[chain]
    } else {
      const exports = masterchefExports({ chain, ...helperConfig })
      result[chain] = exports[chain]
    }
  })

  return result
}

const configs = {
  // ============================================================
  // Old-style adapters (masterChefExports from helper/masterchef.js)
  // ============================================================
  'animal-farm': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', tokenIsOnCoingecko: false },
  },
  'arc-swap': {
    _options: { helperType: 'old' },
    ethereum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE' },
  },
  'avaviking': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'banana': {
    _options: { helperType: 'old' },
    boba: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', tokenIsOnCoingecko: false },
  },
  'banksyfarm': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'bastilledelabouje': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x51839D39C4Fa187E3A084a4eD34a4007eae66238', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'blackgoat-finance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'boujefinance': {
    _options: { helperType: 'old' },
    methodology: 'TVL includes all farms in MasterChef contract',
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'buffaloswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'caribou-finance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', tokenIsOnCoingecko: false },
  },
  'cgx-finance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', tokenIsOnCoingecko: false },
  },
  'clayswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'cougarswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    fantom: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE' },
    harmony: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
    moonbeam: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', tokenIsOnCoingecko: false },
    arbitrum: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'coup-farm': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'cronofi-finance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3Df064069Ba2c8B395592E7834934dBC48BbB955', tokenIsOnCoingecko: false },
  },
  'cyberdog-finance': {
    _options: { helperType: 'old' },
    cronos: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x7a6a832eB5F58245F7d75eD980cED849D69A98FD', tokenIsOnCoingecko: false },
  },
  'cyberfantasyfembots': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xe29E3D9Fa721dFA10ba879fbf0E947425dA611cB', tokenIsOnCoingecko: false },
  },
  'dinoswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    polygon: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: ADDRESSES.polygon.DINO, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accDinoPerShare)' },
  },
  'draco-story': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x01d3569eedd1dd32a698cab22386d0f110d6b548', tokenIsOnCoingecko: false },
  },
  'farmton': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x4243cCC302A98B577678d87A53c75593199315A3', tokenIsOnCoingecko: false },
  },
  'fatfire': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xa5ee311609665Eaccdbef3BE07e1223D9dBe51de', tokenIsOnCoingecko: false },
  },
  'frog-nation-farm': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'ftm-frens': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'furylabsfinance': {
    _options: { helperType: 'old' },
    methodology: 'Counts tokens held in the masterchef contract(0x46531ea0E7cec64b14181d45F8C6798a1cE45da1)',
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'grassland-finance': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x54c6960fbb3e6572377980277057cf08ccad646b', tokenIsOnCoingecko: false },
  },
  'hotpot-finance': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x00438AE909739f750c5df58b222Fe0Bde900C210', tokenIsOnCoingecko: false },
  },
  'ice-colony': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x6ad1eEdDf1b1019494E6F78377d264BB2518db6F', tokenIsOnCoingecko: false },
  },
  'kawaiiswap-finance': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x9e236b43D779B385c3279820e322ABAE249D3405', tokenIsOnCoingecko: false },
  },
  'ketchupfinance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x5D266f324Eb3DD753fF828fA45d80F09D7C75dff', tokenIsOnCoingecko: false },
  },
  'kimochifinance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all farms in MasterChef contract',
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x4dA95bd392811897cde899d25FACe253a424BfD4' },
  },
  'kyrios': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xdbf8a44f447cf6fa300fa84c2aac381724b0c6dd', tokenIsOnCoingecko: false },
  },
  'lemonswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x9477477CdDC4A05419A402A9754725Bc9Ee6a40e', tokenIsOnCoingecko: false },
  },
  'life': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x8877E4B70C50CF275C2B77d6a0F69a312F5eE236', tokenIsOnCoingecko: false },
  },
  'lolsurprisefinance': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x7AB619B5Bb51eF3ed099A8A81948481Fe5e6099c' },
  },
  'lowcostswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xDBfe47255CbA4A7623985444E730719E9F958E67', tokenIsOnCoingecko: false },
  },
  'mapledefi': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x8853759fEC86302F4291F001835E2383538F837A', tokenIsOnCoingecko: false },
  },
  'matrix': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'Tokens in masterchef',
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x35c167b6a1Fc4D1D2b55293367ef5b8D4aF0a696', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accMatrixPerShare, uint16 depositFeeBP, uint256 harvestInterval)' },
  },
  'meowswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xE8658B07c555E9604329A6a0A82FF6D9c6F68D2F' },
  },
  'mesofinance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x4D9361A86D038C8adA3db2457608e2275B3E08d4' },
  },
  'metacrono-finance': {
    _options: { helperType: 'old' },
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x92926DAcCE437955aa47F0DFC7F5C8FCd728b36E', tokenIsOnCoingecko: false },
  },
  'mfinance': {
    _options: { helperType: 'old' },
    ethereum: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x06b0c26235699b15e940e8807651568b995a8e01', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accMGPerShare)' },
  },
  'mirai': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xC6db58E05F647e6D0EE1bf38aC2619867cb9D3cD', tokenIsOnCoingecko: false },
  },
  'mixswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0xb8b9e96e9576af04480ff26ee77d964b1996216e', tokenIsOnCoingecko: false },
  },
  'newspace': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xbbdaA8700A7caAAf3b4aAc1fA6Fb5fF76Fc14C56' },
  },
  'niob': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b', tokenIsOnCoingecko: false },
  },
  'onyxdao-farm': {
    _options: { helperType: 'old' },
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xB7cD6C8C4600AeD9985d2c0Eb174e0BEe56E8854', tokenIsOnCoingecko: false },
  },
  'pandaland': {
    _options: { helperType: 'old' },
    smartbch: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x288B6Ca2eFCF39C9B68052B0088A0cB3f3D3B5f2', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare)' },
  },
  'pearzap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xdf7c18ed59ea738070e665ac3f5c258dcc2fbad8', tokenIsOnCoingecko: false },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xc8644956a0c9334a82f26f5773f5dc090d095d2a', tokenIsOnCoingecko: false },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x7c10108d4b7f4bd659ee57a53b30df928244b354', tokenIsOnCoingecko: false },
  },
  'philetairussocius': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0xc7Cc9D4010387Fc48e77a4Dc871FA39c26efaEEF', tokenIsOnCoingecko: false },
  },
  'polygonfarm-finance': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xf5EA626334037a2cf0155D49eA6462fDdC6Eff19' },
  },
  'polyshield': {
    _options: { helperType: 'old' },
    methodology: 'TVL includes all farms and vaults in MasterChef contract',
    polygon: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0xf239e69ce434c7fb408b05a0da416b14917d934e' },
  },
  'polyyeld': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x1fd6cF265fd3428F655378a803658942095b4C4e' },
  },
  'procyon-finance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xAd421C4F5F091f597361080d47B6f44ED44F155a', tokenIsOnCoingecko: false },
  },
  'robiniaswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0xAfAEEe58a58867c73245397C0F768FF041D32d70' },
  },
  'rubik': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xF00e46f3eEd43232c882c16796eE1D6793a33675', tokenIsOnCoingecko: false },
  },
  'scranton-finance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xd0e7e2a4e0b7df94a095346c55665ba586d3caa4', tokenIsOnCoingecko: false },
  },
  'shiroswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x4ddba615a7F6ee612d3a23C6882B698dFBbef7E7', tokenIsOnCoingecko: false },
  },
  'solanafarm': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all farms in MasterChef contract',
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xFEa6aB80cd850c3e63374Bc737479aeEC0E8b9a1' },
  },
  'spectrumswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', tokenIsOnCoingecko: false },
  },
  'stormswap': {
    _options: { helperType: 'old' },
    methodology: 'We count liquidity on the Fields (LP tokens) and Lagoons(single tokens) sections through MasterChef Contracts',
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE' },
    cronos: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE' },
  },
  'StrikeX': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'sunflowerfi': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all farms in MasterChef contract',
    bsc: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'superman-swap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0x1a5A8873DB5b83D9594A381F33CFE2A5543A9Ec6', tokenIsOnCoingecko: false },
  },
  'swift-finance': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x0Aa4ef05B43700BF4b6E6Dc83eA4e9C2CF6Af0fA', poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSwiftPerShare, uint16 depositFeeBP)' },
  },
  'thedon': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x62E96896d417dD929A4966f2538631AD5AF6Cb46', tokenIsOnCoingecko: false },
  },
  'theseedfarm': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x37427C72f3534d854EE462d18f42aD5fbE74AA2B' },
  },
  'thoreum': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x580dE58c1BD593A43DaDcF0A739d504621817c05' },
  },
  'troydefi': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x576BB65B52425d59AC4c702376F88c527f5C7773' },
  },
  'vapedao': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x6a2d140f66fbf1b910ec45c4cf17f9f21b195a77', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)' },
  },
  'vbrb': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xC92767054275c760490DC2ceA4d0511D670fA61C', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)' },
  },
  'vivelabouje': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', stakingToken: '0xE509Db88B3c26D45f1fFf45b48E7c36A8399B45A', tokenIsOnCoingecko: false },
  },
  'waterfallbsc': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xFdf36F38F5aD1346B7f5E4098797cf8CAE8176D0', tokenIsOnCoingecko: false },
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xedBF59b40336244c6ea94A11a6B0cF6864c87E83', tokenIsOnCoingecko: false },
  },
  'weve': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x911da02c1232a3c3e1418b834a311921143b04d7', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)' },
  },
  'xrayswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0x12C415aAFB1A521B42251e972BB7Ce6795F7669b' },
  },
  'zinaxdao': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', stakingToken: '0xFf3Aa0D4874C3BD5AdcBB94254005ff19f798AcB', tokenIsOnCoingecko: false },
  },

  // ============================================================
  // New-style adapters (masterchefExports from helper/unknownTokens.js)
  // ============================================================
  'anchorswap': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x4aac18De824eC1b553dbf342829834E4FF3F7a9F' },
  },
  'artemis': {
    misrepresentedTokens: true,
    harmony: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: ADDRESSES.harmony.MIS, useDefaultCoreAssets: true, blacklistedTokens: ['0xed0b4b0f0e2c17646682fc98ace09feb99af3ade'] },
  },
  'astralfarm': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0xd95322C0D069B51a41ed2D94A39617C2ACbcE636' },
  },
  'babypigfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x3a76b1b3e827cc7350e66a854eced871a81a3527' },
  },
  'baker-guild-finance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xfe27133f2e8c8539363883d914bccb4b21ebd28a' },
  },
  'beglobal': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xcF958B53EC9340886d72bb4F5F2977E8C2aB64D3' },
  },
  'bigdataprotocol': {
    misrepresentedTokens: true,
    ethereum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 rewardPerShare)' },
  },
  'blackbird-finance': {
    misrepresentedTokens: true,
    cronos: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0x9A3d8759174f2540985aC83D957c8772293F8646' },
  },
  'BoneSwap': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x16d0046597b0E3B136CDBB4edEb956D04232A711', useDefaultCoreAssets: true, lps: ['0x552de336afae1cd17bf1df517403f686f550f21e', '0x5704d76389bfbde1ab2b642ed9ea720bace88cc9'] },
  },
  'boobs-fi': {
    misrepresentedTokens: true,
    base: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeTokens: ['0x66b70221b22925c4663C46cd15f2f2EaaC822CEB'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'boom': {
    misrepresentedTokens: true,
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xe88Ac56C4dedc973a0a26C062F0F07568dfb23FA', useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBoomPerShare)' },
  },
  'butterflyfinance': {
    misrepresentedTokens: true,
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xbA5e6D1B37978c4fee748EEd33142171678DC840', useDefaultCoreAssets: true },
  },
  'camel-farm': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0xb5734ac76d44bdf32b8dd4331e5bfc3bf9989cda', coreAssets: [ADDRESSES.arbitrum.WETH] },
  },
  'cashcowprotocol': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xf823f18d13df1ffdced206708d389dd455bb802b' },
  },
  'catsapes': {
    misrepresentedTokens: true,
    kava: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'ChirpFinance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeTokens: ['0xCa66B54a8A4AD9a231DD70d3605D1ff6aE95d427'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'chocobase': {
    misrepresentedTokens: true,
    base: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x6d6080492D0Bd40F1e44cc16791CC1664357f685'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'chocoInu-masterchef': {
    misrepresentedTokens: true,
    shibarium: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0xC7cc176b2a098fF7cFd578C9eF0Cc8b1216C8ED1'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'ColaFactory': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeTokens: ['0x02Dff78fDeDaF86D9dfbe9B3132aA3Ea72Ed1680'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i, blacklistedTokens: ['0x9bd778df9b803a2df1fbe94ca9b5765cdb299a23'] },
  },
  'colors': {
    misrepresentedTokens: true,
    sonic: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xd1F4414c66E5e046635A179143820f4CBf0D3D3b', poolInfoABI: 'function getPoolInfo(uint256 _pid) external view returns (address lpToken, uint256 _allocPoint)' },
  },
  'cookiebase-farm': {
    misrepresentedTokens: true,
    base: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x614747C53CB1636b4b962E15e1D66D3214621100'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'cryptoyieldfocus': {
    misrepresentedTokens: true,
    hallmarks: [['2021-09-11', 'Rug Pull']],
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x411491859864797792308723Fc417f11BbA18D1b' },
  },
  'cupid': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xD4C000c09bfeF49ABBd5c3728fcec3a42c68eBa1' },
  },
  'darkmatter': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x90E892FED501ae00596448aECF998C88816e5C0F', blacklistedTokens: ['0xaae8c712e9a3487e7b89d604181f2d29c4c48735'] },
  },
  'daytona-finance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x9F8182aD65c53Fd78bd07648a1b3DDcB675c6772'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'dogeclaw': {
    misrepresentedTokens: true,
    okexchain: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xc2f1a8570361DAA6994936d1Dd397e1434F2E2B3', useDefaultCoreAssets: true },
  },
  'dogepup': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x1b15b9446b9f632a78396a1680DAaE17f74Ce8d9'], useDefaultCoreAssets: true },
  },
  'dogium-farm': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x55bd2a3904c09547c3a5899704f1207ee61878be'], useDefaultCoreAssets: true },
  },
  'doorainu': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xb7ffA0D35597d2e166384fc88Ed746a4c74be001', useDefaultCoreAssets: true },
  },
  'dracoforce': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x8d05B42749428C26613deB12f8989Cb8D1f5c17f' },
  },
  'dragonfruit': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x2A3C691e08262aC2406aB9C3ee106C59Fff3E5ec'], useDefaultCoreAssets: true },
  },
  'dungeonswap': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x14c358b573a4ce45364a3dbd84bbb4dae87af034' },
  },
  'emumeme': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x0dfbB60c53d9226E8D70AA94eac614D8294D7Fa2', useDefaultCoreAssets: true },
  },
  'fantompup': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x900825EA297c7c5D1F6fA54146849BC41EdDAf29' },
  },
  'frogswap-farm': {
    misrepresentedTokens: true,
    degen: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x7D4F462895AD2A6856cb6e94055B841C3cA55987'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'gemmine': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x1e2a499fAefb88B2d085d7036f3f7895542b09De' },
  },
  'genesys': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xf8b234a1ce59991006930de8b0525f9013982746' },
  },
  'jaguarswap': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0x31535F7A83083E3f34899F356ECC7246FBF2E82D' },
  },
  'jetmine': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x71BE8F5F245c1F5aa5727DFdB36aAD3C71a4c26b' },
  },
  'kafidao': {
    misrepresentedTokens: true,
    kava: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x254B63C7481A16bC4080f0Ab369320004f79Cca3', useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accKfdPerShare)' },
  },
  'kebab-finance': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x7979F6C54ebA05E18Ded44C4F986F49a5De551c2', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)' },
  },
  'knightsfantom': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xba36266B6565C96BD77815fa898f403Cc06F64cf' },
  },
  'lavafall': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x7A0Ac775d290A7a3016f153d757Fbc3c4De62488' },
  },
  'maduck': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xb976d9684412f75f7aee24e56d846fd404b1b329', useDefaultCoreAssets: true },
  },
  'mintswap': {
    misrepresentedTokens: true,
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x7bf4ca9aec25adaaf7278eedbe959d81893e314f' },
  },
  'mockingbird': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x0A737c40E42b164B30c0d3E5A19152CB89aA3EB9' },
  },
  'moneyrainfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x9ce66Ef13D88cb1bC567E47459841483c5d9457C' },
  },
  'mymine': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x3d3121D2aeDff5e11E390027331CB544Bc3D2C59' },
  },
  'potluckprotocol': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x49894fcc07233957c35462cfc3418ef0cc26129f' },
  },
  'PulseGun-farm': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0xa39e7837B0c283e7ce07cfA7ca3DeEe58fbcbCd8'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'redemptionfi': {
    misrepresentedTokens: true,
    base: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0x41E99e0F73a88947C52070FF67C19B7aBc171A54', useDefaultCoreAssets: true },
  },
  'Ringswap': {
    misrepresentedTokens: true,
    sonic: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeTokens: ['0x4931CE8f4130a723cC6fF8A0B23B7F33550aB3a4'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'ryoshi': {
    misrepresentedTokens: true,
    dogechain: {
      masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
      nativeTokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0xa98fa09D0BED62A9e0Fb2E58635b7C9274160dc7'],
      useDefaultCoreAssets: true,
      poolLengthAbi: 'uint256:poolCounter',
      poolInfoABI: 'function pools(uint256) view returns (address stakingToken, address rewardsToken, uint256 duration, uint256 finishAt, uint256 updatedAt, uint256 rewardRate, uint256 rewardPerTokenStored, uint256 totalSupply)',
      getToken: i => i.stakingToken === ADDRESSES.null ? ADDRESSES.dogechain.WWDOGE : i.stakingToken,
    },
  },
  'scarecrow': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46e1Ee17f51c52661D04238F1700C547dE3B84A1' },
  },
  'spectrefi': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x2834d4F4cC40bd7D78c07E2D848358364222C272' },
  },
  'spiritfarm': {
    misrepresentedTokens: true,
    base: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xC7A148Ad554826b5308E100a05Fdb037DDa0bDe4', useDefaultCoreAssets: true },
  },
  'squidstake': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xAE61e7dc989718E700C046a2483e93513eDCA484' },
  },
  'statixfarm': {
    misrepresentedTokens: true,
    base: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xA28BAc0427e4a722246Ce4E9aD89Ec95FF8B87A3', useDefaultCoreAssets: true },
  },
  'sudoinu': {
    misrepresentedTokens: true,
    ethereum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x93b743Fb12a2677adB13093f8eA8464A436DA008'], useDefaultCoreAssets: true, poolInfoABI: 'function poolToken(uint256) view returns (address)', getToken: i => i },
  },
  'thedragonslair': {
    misrepresentedTokens: true,
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x88c090496125b751B4E3ce4d3FDB8E47DD079c57' },
  },
  'treedefi': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0xf0fcd737fce18f95621cc7841ebe0ea6efccf77e', '0x40b34cc972908060d6d527276e17c105d224559d'] },
  },
  'trickortreat': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xA5aFce54270D9afA6a80464bBD383BE506888e6A' },
  },
  'undeadfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x89dD4d82F4aF70df521A76A4f0997b5Dc571917E' },
  },
  'unirexfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x350a911687eb9710f1d36792f26d419577b127a8' },
  },
  'uniwswap-unia': {
    misrepresentedTokens: true,
    doublecounted: true,
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xe547fab4d5ceafd29e2653cb19e6ae8ed9c8589b', useDefaultCoreAssets: true },
    ethpow: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0x2a0cf46ecaaead92487577e9b737ec63b0208a33', useDefaultCoreAssets: true },
  },
  'verified-credits': {
    misrepresentedTokens: true,
    kava: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'veritable': {
    misrepresentedTokens: true,
    polygon: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x6397835430a5a5f8530F30C412CB217CE3f0943b', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accVRTPerShare)' },
  },
  'waterdendy': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0x88692aD37c48e8F4c821b71484AE3C2878C2A2C6', useDefaultCoreAssets: true },
  },
  'waterfallfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x6b2a7B82d3F7a6e1F5A5831aB40666Ec717645d5' },
  },
  'wildbase': {
    misrepresentedTokens: true,
    base: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xbCDa0bD6Cd83558DFb0EeC9153eD9C9cfa87782E', useDefaultCoreAssets: true },
  },
  'wtfdoge-farm': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xeF7B2204B5c4DCe2b30600B89e1C11bb881f3564', useDefaultCoreAssets: true, lps: ['0x62b44635A4AeBcA4D329AdD86BC34d00869eF4d2', '0x52d8E261cfdc7E62e783611b0bB6a3064dF9FC05'] },
  },
  'xbluefinance': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x50AA7A13B28EeA97dc6C3f5E8aaa7fE512e7306D', useDefaultCoreAssets: true },
  },
  'xmaspast': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0xD3111Fb8BDf936B11fFC9eba3b597BeA21e72724' },
  },
  'YieldPulseFinance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0xDd40a166b43c0b95F1248c9A5AFFD7A166f1526a'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'YogurtFinance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeTokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },

  // ============================================================
  // Multi-masterchef adapters (previously using mergeExports)
  // ============================================================
  'magicland': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    iotex: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'ester': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accESTPerShare, address strat)' },
  },
  'tenet': {
    misrepresentedTokens: true,
    ethereum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', poolInfoABI: 'function poolSettingInfo(uint256) view returns (address lpToken, address tokenAddr, address projectAddr, uint256 tokenAmount, uint256 startBlock, uint256 endBlock, uint256 tokenPerBlock, uint256 tokenBonusEndBlock, uint256 tokenBonusMultipler)' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', poolInfoABI: 'function poolSettingInfo(uint256) view returns (address lpToken, address tokenAddr, address projectAddr, uint256 tokenAmount, uint256 startBlock, uint256 endBlock, uint256 tokenPerBlock, uint256 tokenBonusEndBlock, uint256 tokenBonusMultipler)' },
  },
  'salem': {
    misrepresentedTokens: true,
    cronos: { masterchef: '0xBD124D3B18a382d807a9E491c7f1848403856B08', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    fantom: { masterchef: '0xdA2A9024D8D01F4EA0aa35EEdf771432095219ef', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    polygon: { masterchef: '0x53D392646faB3caE0a08Ead31f8B5cBFFf55b818', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'rbx': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x864d434308997e9648838d23f3eedf5d0fd17bea', blacklistedTokens: ['0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'], nativeToken: '0xace3574b8b054e074473a9bd002e5dc6dd3dff1b' },
    ethereum: { masterchef: '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'parrotegg': {
    misrepresentedTokens: true,
    iotex: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x176cb5113b4885b3a194bd69056ac3fe37a4b95c' },
    harmony: { masterchef: '0xFb15945E38a11450AF5E3FF20355D71Da72FfE8a', nativeToken: '0xC36769DFcDF05B2949F206FC34C8870707D33C89' },
    arbitrum: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
    polygon: { masterchef: '0x34E4cd20F3a4FdC5e42FdB295e5A118D4eEB0b79', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  },
  'koala-defi': {
    misrepresentedTokens: true,
    polygon: { masterchef: '0xf6948f00FC2BA4cDa934C931628B063ed9091019', nativeToken: '0x04f2e3ec0642e501220f32fcd9e26e77924929a9' },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0xb2ebaa0ad65e9c888008bf10646016f7fcdd73c3' },
  },
  'HoneyFarm': {
    misrepresentedTokens: true,
    avax: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', blacklistedTokens: ['0x1ce0c2827e2ef14d5c4f29a091d735a204794041'] },
    bsc: { masterchef: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', nativeToken: '0x1A8d7AC01d21991BF5249A3657C97b2B6d919222' },
  },
  'marshamallowdefi': {
    misrepresentedTokens: true,
    bsc: [
      { masterchef: '0x8932a6265b01D1D4e1650fEB8Ac38f9D79D3957b', nativeTokens: ['0x787732f27d18495494cea3792ed7946bbcff8db2', '0xe1f2d89a6c79b4242f300f880e490a70083e9a1c'], poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accEggPerShare, uint16 depositFeeBP)', blacklistedTokens: ['0x00000000548997391c670a5179af731a30e7c3ad'] },
      { masterchef: '0xEE49Aa34833Ca3b7d873ED63CDBc031A09226a5d', nativeTokens: ['0x787732f27d18495494cea3792ed7946bbcff8db2', '0xe1f2d89a6c79b4242f300f880e490a70083e9a1c'], poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accEggPerShare, uint16 depositFeeBP)', blacklistedTokens: ['0x00000000548997391c670a5179af731a30e7c3ad'] },
    ],
  },
  'lume': {
    misrepresentedTokens: true,
    cronos: [
      { masterchef: '0xF3cCE1bCe378B56BA24Cf661E2bA128303DD8b88', nativeToken: '0xB3551aCf805D5F90A1Fd7444B6571BdC069F40b2', poolInfoABI: 'function getPoolInfo(uint256 _pid) external view returns (address lpToken, uint256 _allocPoint)' },
      { masterchef: '0x21dFe774C313AA92392725ac51693E26072c8099', nativeToken: '0x6d810420Fcee6478cE73d4f466A094BBAdE11dA6', poolInfoABI: 'function poolInfo(uint256 _pid) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accNovaPerShare, bool isStarted)' },
    ],
  },
  'smurfmoney': {
    misrepresentedTokens: true,
    fantom: [
      { masterchef: '0xdD4Ddef5be424a6b5645dF4f5169e3cbA6a975Db', nativeTokens: ['0x53a5f9d5adc34288b2bff77d27f55cbc297df2b9', '0x465bc6d1ab26efa74ee75b1e565e896615b39e79'] },
      { masterchef: '0x772dEC3e4A9B18e3B2636a70e11e4e0a90F19575', nativeTokens: ['0x53a5f9d5adc34288b2bff77d27f55cbc297df2b9', '0x465bc6d1ab26efa74ee75b1e565e896615b39e79'] },
    ],
  },
  'sapphire': {
    misrepresentedTokens: true,
    fantom: [
      { masterchef: '0x5A3b5A572789B87755Fa7720A4Fae36e2e2D3b35', nativeToken: '0xfa7d8c3CccC90c07c53feE45A7a333CEC40B441B' },
      { masterchef: '0xD1b96929AceDFa7a2920b5409D0c5636b89dcD85', nativeToken: '0xB063862a72d234730654c0577C188452424CF53c' },
    ],
  },
  'polyquail': {
    misrepresentedTokens: true,
    polygon: [
      { masterchef: '0xeA038416Ed234593960704ddeD73B78f7D578AA0', nativeTokens: ['0x252656AdC9E22C697Ce6c08cA9065FBEe5E394e7', '0x4f219CfC1681c745D9558fd64d98373A21a246CA', '0x6116A2A8Ea71890Cf749823Ee9DEC991930a9eEa'] },
      { masterchef: '0xE1de7a777C1f0C85ca583c143b75e691a693e04B', nativeTokens: ['0x252656AdC9E22C697Ce6c08cA9065FBEe5E394e7', '0x4f219CfC1681c745D9558fd64d98373A21a246CA', '0x6116A2A8Ea71890Cf749823Ee9DEC991930a9eEa'] },
      { masterchef: '0x439E9BE4618bfC5Ebe9B7357d848F65D24a50dDE', nativeTokens: ['0x252656AdC9E22C697Ce6c08cA9065FBEe5E394e7', '0x4f219CfC1681c745D9558fd64d98373A21a246CA', '0x6116A2A8Ea71890Cf749823Ee9DEC991930a9eEa'] },
    ],
  },
  'frostfinance': {
    misrepresentedTokens: true,
    avax: [
      { masterchef: '0xCEA209Fafc46E5C889A8ad809e7C8e444B2420C0', nativeTokens: ['0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1', '0xf57b80a574297892b64e9a6c997662889b04a73a', '0x314f3bee25e49ea4bcea9a3d1321c74c95f10eab'] },
      { masterchef: '0x02941a0Ffa0Bb0E41D9d96314488d2E7652EDEa6', nativeTokens: ['0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1', '0xf57b80a574297892b64e9a6c997662889b04a73a', '0x314f3bee25e49ea4bcea9a3d1321c74c95f10eab'] },
      { masterchef: '0x87f1b38D0C158abe2F390E5E3482FDb97bC8D0C5', nativeTokens: ['0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1', '0xf57b80a574297892b64e9a6c997662889b04a73a', '0x314f3bee25e49ea4bcea9a3d1321c74c95f10eab'] },
    ],
  },
  'arenaswap': {
    misrepresentedTokens: true,
    bsc: [
      { masterchef: '0xbEa60d145747a66CF27456ef136B3976322b7e77', nativeTokens: ['0x2A17Dc11a1828725cdB318E0036ACF12727d27a2', '0xedeCfB4801C04F3EB394b89397c6Aafa4ADDa15B'] },
      { masterchef: '0x3e91B21ddE13008Aa73f07BdE26970322Fe5D533', nativeTokens: ['0x2A17Dc11a1828725cdB318E0036ACF12727d27a2', '0xedeCfB4801C04F3EB394b89397c6Aafa4ADDa15B'] },
    ],
  },
}

module.exports = buildProtocolExports(configs, masterchefExportFn)
