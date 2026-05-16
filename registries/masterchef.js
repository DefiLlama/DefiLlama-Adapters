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
    bsc: { masterchef: '0xe5d9c56B271bc7820Eee01BCC99E593e3e7bAD44', stakingToken: '0xdbdc73b95cc0d5e7e99dc95523045fc8d075fb9e', tokenIsOnCoingecko: false },
  },
  'arc-swap': {
    _options: { helperType: 'old' },
    ethereum: { masterchef: '0x1575F4b5364dDBd6c9C77D1fE603E2d76432aA6a', stakingToken: '0xC82E3dB60A52CF7529253b4eC688f631aad9e7c2' },
  },
  'avaviking': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0xEF8285A4B4F21D3F9dC9E5cEf7E39977E2Ef8B3d', stakingToken: '0xF1b0F6DF4fc3710b3497c34B0Ee366099054add8', tokenIsOnCoingecko: false },
  },
  'banana': {
    _options: { helperType: 'old' },
    boba: { masterchef: '0x0e69359B4783094260abFaD7dD904999fc1d6Fd0', stakingToken: '0xc67b9b1b0557aeafa10aa1ffa1d7c87087a6149e', tokenIsOnCoingecko: false },
  },
  'banksyfarm': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x64aB872a2937dE057F21c8e0596C0175FF2084d8', stakingToken: '0x9C26e24ac6f0EA783fF9CA2bf81543c67cf446d2', tokenIsOnCoingecko: false },
  },
  'bastilledelabouje': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x51839D39C4Fa187E3A084a4eD34a4007eae66238', stakingToken: '0xcef2b88d5599d578c8d92E7a6e6235FBfaD01eF4', tokenIsOnCoingecko: false },
  },
  'blackgoat-finance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x46ba4eF20f78e881A8219E5368107181617afB50', stakingToken: '0xa9351B9Bf071a95bEFDAa1e76267919A7214b922', tokenIsOnCoingecko: false },
  },
  'boujefinance': {
    _options: { helperType: 'old' },
    methodology: 'TVL includes all farms in MasterChef contract',
    fantom: { masterchef: '0x89dcd1DC698Ad6A422ad505eFE66261A4320D8B5', stakingToken: '0x37F70aa9fEfc8971117BD53a1Ddc2372aa7Eec41' },
  },
  'buffaloswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x67D26cF7e6CB68feE0Cf546Ac489691d961c97da', stakingToken: '0x10a49f1fc8c604ea7f1c49bcc6ab2a8e58e77ea5' },
  },
  'caribou-finance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x23bd5312cE63AC23651112d3c9638C082aaeAf38', stakingToken: '0x2dBa3ea510cf7bFCCc9c185b7c9094d687ADE503', tokenIsOnCoingecko: false },
  },
  'cgx-finance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    cronos: { masterchef: '0xd6b3bf54ef015259cc92880cd639c1f3c22e2b85', stakingToken: '0x40ff4581cf2d6e4e07b02034105d6435d4f3f84c', tokenIsOnCoingecko: false },
  },
  'clayswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x4c7fc1495559a13d68fa4b60286621dfcec16cf3', stakingToken: '0xfd54aE2369a3Be69d441cAcC49F920fFCd9068Ac', tokenIsOnCoingecko: false },
  },
  'cougarswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    bsc: { masterchef: '0x8E934F14bD904A46e0C8aF7de6aEeAaaa0D8C2c5', stakingToken: '0x26d88b1e61e22da3f1a1ba95a1ba278f6fcef00b' },
    polygon: { masterchef: '0x9bFcf65e7De424a6D89Eef23B3dF8cdc965c654F', stakingToken: '0x047fD3B3D2366F9babe105ade4598E263d6c699c' },
    fantom: { masterchef: '0x1CA27c8f19EF84F5f5A9cf2E2874E4Bf91fD38C4', stakingToken: '0x5a2e451fb1b46fde7718315661013ae1ae68e28c' },
    harmony: { masterchef: '0x1357521115A4dAA6524045215ac7F979e64d6079', stakingToken: '0x6cc35220349c444c39b8e26b359757739aaec952' },
    avax: { masterchef: '0xa127A67D1429B3f8d33a4E0398347661c3737a12', stakingToken: '0x727C43b707C6Fe3ACD92f17EFAC8e05476DFa81c' },
    cronos: { masterchef: '0x07586393ed706e5dBf637195d8cf22F5844F234e', stakingToken: '0x4e57e27e4166275Eb7f4966b42A201d76e481B03', tokenIsOnCoingecko: false },
    moonbeam: { masterchef: '0xc5C772e21A39f88f0960172016Cf455Da6fF52Af', stakingToken: '0x2Dfc76901bB2ac2A5fA5fc479590A490BBB10a5F', tokenIsOnCoingecko: false },
    arbitrum: { masterchef: '0xd619f601404a2406b5d93f6ff9A9465BbBDA73cc', stakingToken: '0x5cb91B0b2d2C80c7104b04E134B43b89b4d2f98A', tokenIsOnCoingecko: false },
  },
  'coup-farm': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x5b37fE841b505CEa35Fe93A6c080b5930a8155c0', stakingToken: '0xb2f9a4380ebca7e057db0c4572b7ac90c353ce7d', tokenIsOnCoingecko: false },
  },
  'cronofi-finance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    cronos: { masterchef: '0xdc0E1690c594dDD1654544e74036Ee0b0029573d', stakingToken: '0x3Df064069Ba2c8B395592E7834934dBC48BbB955', tokenIsOnCoingecko: false },
  },
  'cyberdog-finance': {
    _options: { helperType: 'old' },
    cronos: { masterchef: '0x61bA12f76F7993115Fcf86Fd6147008A6790589D', stakingToken: '0x7a6a832eB5F58245F7d75eD980cED849D69A98FD', tokenIsOnCoingecko: false },
  },
  'cyberfantasyfembots': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x844cC08183589D0D669fdCC223476a0FE9712F55', stakingToken: '0xe29E3D9Fa721dFA10ba879fbf0E947425dA611cB', tokenIsOnCoingecko: false },
  },
  'dinoswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    polygon: { masterchef: '0x1948abC5400Aa1d72223882958Da3bec643fb4E5', stakingToken: ADDRESSES.polygon.DINO, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accDinoPerShare)' },
  },
  'draco-story': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0xAedCc6E2710d2E47b1477A890C6D18f7943C0794', stakingToken: '0x01d3569eedd1dd32a698cab22386d0f110d6b548', tokenIsOnCoingecko: false },
  },
  'farmton': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x87F68799eB8fC579eDDC6381331882A3ee4e997e', stakingToken: '0x4243cCC302A98B577678d87A53c75593199315A3', tokenIsOnCoingecko: false },
  },
  'fatfire': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0xf908ed281f008eE3FcEaCfF2FdfbC2dADf213811', stakingToken: '0xa5ee311609665Eaccdbef3BE07e1223D9dBe51de', tokenIsOnCoingecko: false },
  },
  'frog-nation-farm': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x254D43bD428DA1420Ee043cD30bDA455f353c241', stakingToken: '0xFA5c941BC491Ee6Dc1E933f38d01d8B5D5637205' },
  },
  'ftm-frens': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x48C2913b014B34979585281df22c6ffbcc53862b', stakingToken: '0x4cC23f962d872938d478803c4499079517dB2666', tokenIsOnCoingecko: false },
  },
  'furylabsfinance': {
    _options: { helperType: 'old' },
    methodology: 'Counts tokens held in the masterchef contract(0x23e2DA1657C2b552185d7AF485d6f4825f68200a)',
    fantom: { masterchef: '0x23e2DA1657C2b552185d7AF485d6f4825f68200a', stakingToken: '0xB1822A7ee73DD7de6Eda328A0681f8E1779CC4B6', tokenIsOnCoingecko: false },
  },
  'grassland-finance': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x68B279Cfaf1b0CDE999B5590C3Cb5F74AEc1eF6a', stakingToken: '0x54c6960fbb3e6572377980277057cf08ccad646b', tokenIsOnCoingecko: false },
  },
  'hotpot-finance': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x3BD6827d09a0aF02fe4B6688E16F6fAB8F14938e', stakingToken: '0x00438AE909739f750c5df58b222Fe0Bde900C210', tokenIsOnCoingecko: false },
  },
  'ice-colony': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0xFa0A21fFCd1BB6210160582Cd9E42C7E90668F83', stakingToken: '0x6ad1eEdDf1b1019494E6F78377d264BB2518db6F', tokenIsOnCoingecko: false },
  },
  'kawaiiswap-finance': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x1767B9aF34be444e3C727840d8D19dB0256dBCFA', stakingToken: '0x9e236b43D779B385c3279820e322ABAE249D3405', tokenIsOnCoingecko: false },
  },
  'ketchupfinance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x7bBcD33415984b820D31BBda6339E55A03b5F8cA', stakingToken: '0x5D266f324Eb3DD753fF828fA45d80F09D7C75dff', tokenIsOnCoingecko: false },
  },
  'kimochifinance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all farms in MasterChef contract',
    bsc: { masterchef: '0xc88264770C43826dE89bCd48a5c8BC5073e482a5', stakingToken: '0x4dA95bd392811897cde899d25FACe253a424BfD4' },
  },
  'kyrios': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    fantom: { masterchef: '0x7aAa607A456607dd03496065ebBAC52f74c905bE', stakingToken: '0xdbf8a44f447cf6fa300fa84c2aac381724b0c6dd', tokenIsOnCoingecko: false },
  },
  'lemonswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0xD2C91aA7ffAb4CE218f7F6fc9AED7029A57C4B97', stakingToken: '0x9477477CdDC4A05419A402A9754725Bc9Ee6a40e', tokenIsOnCoingecko: false },
  },
  'life': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0xa4Faa5774681AaccE968d5EC7Ff3C3eD0F7ABbEe', stakingToken: '0x8877E4B70C50CF275C2B77d6a0F69a312F5eE236', tokenIsOnCoingecko: false },
  },
  'lolsurprisefinance': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0xE1E5B476aa9d85a7df27839f7894406d2528aBBE', stakingToken: '0x7AB619B5Bb51eF3ed099A8A81948481Fe5e6099c' },
  },
  'lowcostswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x57f70857aB735576ab5216Cd5e58c6dAe72F21D7', stakingToken: '0xDBfe47255CbA4A7623985444E730719E9F958E67', tokenIsOnCoingecko: false },
  },
  'mapledefi': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x0283527f549Aef5e6fb91cC30eB1FC8c88545494', stakingToken: '0x8853759fEC86302F4291F001835E2383538F837A', tokenIsOnCoingecko: false },
  },
  'matrix': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'Tokens in masterchef',
    cronos: { masterchef: '0xacAb1D5FaBD5c675db07d40De8E0E218EBe75A9e', stakingToken: '0x35c167b6a1Fc4D1D2b55293367ef5b8D4aF0a696', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accMatrixPerShare, uint16 depositFeeBP, uint256 harvestInterval)' },
  },
  'meowswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x4bdd4BdEf3a2e3b707012A31cd993149fE6dE7DF', stakingToken: '0xE8658B07c555E9604329A6a0A82FF6D9c6F68D2F' },
  },
  'mesofinance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x30b65159dB82eFCf8CEde9861bc6B85336310EB2', stakingToken: '0x4D9361A86D038C8adA3db2457608e2275B3E08d4' },
  },
  'metacrono-finance': {
    _options: { helperType: 'old' },
    cronos: { masterchef: '0x5F680E57778651f7Cb14678655822ABc469acacf', stakingToken: '0x92926DAcCE437955aa47F0DFC7F5C8FCd728b36E', tokenIsOnCoingecko: false },
  },
  'mfinance': {
    _options: { helperType: 'old' },
    ethereum: { masterchef: '0x342A8A451c900158BA4f1367C55955b5Fbcb7CCe', stakingToken: '0x06b0c26235699b15e940e8807651568b995a8e01', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accMGPerShare)' },
  },
  'mirai': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x6C6e46c671C848F87A173E95b9511FDA0C84Ba15', stakingToken: '0xC6db58E05F647e6D0EE1bf38aC2619867cb9D3cD', tokenIsOnCoingecko: false },
  },
  'mixswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x775eead1076b149d5eb81065fcd18a3a5717085a', stakingToken: '0xb8b9e96e9576af04480ff26ee77d964b1996216e', tokenIsOnCoingecko: false },
  },
  'newspace': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x24e5C28c060ae0836e6378FfDa3d0846fee0c56E', stakingToken: '0xbbdaA8700A7caAAf3b4aAc1fA6Fb5fF76Fc14C56' },
  },
  'niob': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0xD18B23ad6c8ACc4AD32AAd6a5dF750ce28C8C772', stakingToken: '0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b', tokenIsOnCoingecko: false },
  },
  'onyxdao-farm': {
    _options: { helperType: 'old' },
    arbitrum: { masterchef: '0xF9C83fF6cf1A9bf2584aa2D00A7297cA8F845CcE', stakingToken: '0xB7cD6C8C4600AeD9985d2c0Eb174e0BEe56E8854', tokenIsOnCoingecko: false },
  },
  'pandaland': {
    _options: { helperType: 'old' },
    smartbch: { masterchef: '0x1682051ad5bb1933d5446fa6d4d9ad878df95f21', stakingToken: '0x288B6Ca2eFCF39C9B68052B0088A0cB3f3D3B5f2', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare)' },
  },
  'pearzap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    bsc: { masterchef: '0xd6D8EBf01b79EE3fC1Ab76Dc3eA79bcB209205E4', stakingToken: '0xdf7c18ed59ea738070e665ac3f5c258dcc2fbad8', tokenIsOnCoingecko: false },
    polygon: { masterchef: '0xb12FeFC21b12dF492609942172412d4b75CbC709', stakingToken: '0xc8644956a0c9334a82f26f5773f5dc090d095d2a', tokenIsOnCoingecko: false },
    fantom: { masterchef: '0x8c7c3c72205459e4190D9d3b80A51921f2678383', stakingToken: '0x7c10108d4b7f4bd659ee57a53b30df928244b354', tokenIsOnCoingecko: false },
  },
  'philetairussocius': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x8c8953930634758B1e68C604fCb0B2Bc8F2f2893', stakingToken: '0xc7Cc9D4010387Fc48e77a4Dc871FA39c26efaEEF', tokenIsOnCoingecko: false },
  },
  'polygonfarm-finance': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x9A2C85eFBbE4DD93cc9a9c925Cea4A2b59c0db78', stakingToken: '0xf5EA626334037a2cf0155D49eA6462fDdC6Eff19' },
  },
  'polyshield': {
    _options: { helperType: 'old' },
    methodology: 'TVL includes all farms and vaults in MasterChef contract',
    polygon: { masterchef: '0x0Ec74989E6f0014D269132267cd7c5B901303306', stakingToken: '0xf239e69ce434c7fb408b05a0da416b14917d934e' },
  },
  'polyyeld': {
    _options: { helperType: 'old' },
    polygon: { masterchef: '0x1B8deA992Ebb340a151383E18F63c1e89cE180a4', stakingToken: '0x1fd6cF265fd3428F655378a803658942095b4C4e' },
  },
  'procyon-finance': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all Farms and Pools seccion through MasterChef Contracts',
    cronos: { masterchef: '0x27e85F98B48D447D0148AFeCa7b149b0E69c2c2e', stakingToken: '0xAd421C4F5F091f597361080d47B6f44ED44F155a', tokenIsOnCoingecko: false },
  },
  'robiniaswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x2C875C19E093F446dE65E46473170703486eb0E6', stakingToken: '0xAfAEEe58a58867c73245397C0F768FF041D32d70' },
  },
  'rubik': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0xb1e61bc864511b1da011f0f7b179fab9f12dbbee', stakingToken: '0xF00e46f3eEd43232c882c16796eE1D6793a33675', tokenIsOnCoingecko: false },
  },
  'scranton-finance': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x01E3788ef98F5672DC66185FBA1b50037BA1352d', stakingToken: '0xd0e7e2a4e0b7df94a095346c55665ba586d3caa4', tokenIsOnCoingecko: false },
  },
  'shiroswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0xD91b2cD0f07A453Bd24F6a798f40f6972e616C9f', stakingToken: '0x4ddba615a7F6ee612d3a23C6882B698dFBbef7E7', tokenIsOnCoingecko: false },
  },
  'solanafarm': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all farms in MasterChef contract',
    bsc: { masterchef: '0x378085c11dc493ED90BD582ddA2F248e98388DaD', stakingToken: '0xFEa6aB80cd850c3e63374Bc737479aeEC0E8b9a1' },
  },
  'spectrumswap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0xD56d886b71b32f0817F4309C8368FE8769d479fc', stakingToken: '0x4AE1A0D592DC4d1c51D37C2AEfE6D2572FC47F7a', tokenIsOnCoingecko: false },
  },
  'stormswap': {
    _options: { helperType: 'old' },
    methodology: 'We count liquidity on the Fields (LP tokens) and Lagoons(single tokens) sections through MasterChef Contracts',
    avax: { masterchef: '0xc1A97bCbaCf0566fc8C40291FFE7e634964b0446', stakingToken: '0x6AFD5A1ea4b793CC1526d6Dc7e99A608b356eF7b' },
    cronos: { masterchef: '0x6eC89CCcDb563Ac442d2370F6E47bC1C78e023fC', stakingToken: '0x48713151e5afb7b4cc45f3653c1c59cf81e88d4b' },
  },
  'StrikeX': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x5867Cd4F7e105878AfbC903505c207eb7b130A50', stakingToken: '0xd6fdde76b8c1c45b33790cc8751d5b88984c44ec' },
  },
  'sunflowerfi': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    methodology: 'TVL includes all farms in MasterChef contract',
    bsc: { masterchef: '0x226771f35B00aE9bD4d0dde18dAdA9d24d772223', stakingToken: '0x3295fdE99976e6B6b477E6834b2651a22DeB1dd7' },
  },
  'superman-swap': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0xdE737bd1Af7D93Dd627D68511A9f69565D6D607b', stakingToken: '0x1a5A8873DB5b83D9594A381F33CFE2A5543A9Ec6', tokenIsOnCoingecko: false },
  },
  'swift-finance': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x242c27C5F92e20d70CA0dAA7b76d927DFC7EF20B', stakingToken: '0x0Aa4ef05B43700BF4b6E6Dc83eA4e9C2CF6Af0fA', poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSwiftPerShare, uint16 depositFeeBP)' },
  },
  'thedon': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0xa50ACA2e1c94652Ab842E64410bCe53247eF88ac', stakingToken: '0x62E96896d417dD929A4966f2538631AD5AF6Cb46', tokenIsOnCoingecko: false },
  },
  'theseedfarm': {
    _options: { helperType: 'old' },
    avax: { masterchef: '0x7E0F299F9bb375c44Ddf1b4E520a8eaAE7564D96', stakingToken: '0x37427C72f3534d854EE462d18f42aD5fbE74AA2B' },
  },
  'thoreum': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0xF4168CD3C00799bEeB9a88a6bF725eB84f5d41b7', stakingToken: '0x580dE58c1BD593A43DaDcF0A739d504621817c05' },
  },
  'troydefi': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x0F8E6DD57e86f0Aa9d219AAFAC728004bF96693E', stakingToken: '0x576BB65B52425d59AC4c702376F88c527f5C7773' },
  },
  'vapedao': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0xe3addfe4194062bd2c8011a3e51322887236871d', stakingToken: '0x6a2d140f66fbf1b910ec45c4cf17f9f21b195a77', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)' },
  },
  'vbrb': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x3b646B690d75628C49489A2A453E168A343d0Bb0', stakingToken: '0xC92767054275c760490DC2ceA4d0511D670fA61C', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)' },
  },
  'vivelabouje': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0x1277dd1dCbe60d597aAcA80738e1dE6cB95dCB54', stakingToken: '0xE509Db88B3c26D45f1fFf45b48E7c36A8399B45A', tokenIsOnCoingecko: false },
  },
  'waterfallbsc': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0x49a21E7Ae826CD5F0c0Cb1dC942d1deD66d21191', stakingToken: '0xFdf36F38F5aD1346B7f5E4098797cf8CAE8176D0', tokenIsOnCoingecko: false },
    arbitrum: { masterchef: '0xe9960f14B5f0713D1d530C1fF079A7adAb7c076D', stakingToken: '0xedBF59b40336244c6ea94A11a6B0cF6864c87E83', tokenIsOnCoingecko: false },
  },
  'weve': {
    _options: { helperType: 'old' },
    fantom: { masterchef: '0xe04c26444d37fe103b9cc8033c99b09d47056f51', stakingToken: '0x911da02c1232a3c3e1418b834a311921143b04d7', tokenIsOnCoingecko: false, poolInfoAbi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)' },
  },
  'xrayswap': {
    _options: { helperType: 'old' },
    bsc: { masterchef: '0xD35a150Ec317a8a187C52FC1164b4D15C0851b84', stakingToken: '0x12C415aAFB1A521B42251e972BB7Ce6795F7669b' },
  },
  'zinaxdao': {
    _options: { helperType: 'old' },
    misrepresentedTokens: true,
    bsc: { masterchef: '0x323d2B52F63e38F7b933eA9a0Eb763D2C81B97Ba', stakingToken: '0xFf3Aa0D4874C3BD5AdcBB94254005ff19f798AcB', tokenIsOnCoingecko: false },
  },

  // ============================================================
  // New-style adapters (masterchefExports from helper/unknownTokens.js)
  // ============================================================
  'anchorswap': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x23f7F3119d1b5b6c94a232680e2925703C4ebbF5', nativeToken: '0x4aac18De824eC1b553dbf342829834E4FF3F7a9F' },
  },
  'artemis': {
    misrepresentedTokens: true,
    harmony: { masterchef: '0x59c777cd749b307be910f15c54a3116ff88f9706', nativeToken: ADDRESSES.harmony.MIS, useDefaultCoreAssets: true, blacklistedTokens: ['0xed0b4b0f0e2c17646682fc98ace09feb99af3ade'] },
  },
  'astralfarm': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x13E5A680606aB4965d09B1997486C715dE225EBE', nativeToken: '0xd95322C0D069B51a41ed2D94A39617C2ACbcE636' },
  },
  'babypigfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x7f8ECcC1437aaCEFE533A6f1BfE2144b1d0d7D35', nativeToken: '0x3a76b1b3e827cc7350e66a854eced871a81a3527' },
  },
  'baker-guild-finance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x81A9A4e95443B505ee6b10227E61b74D39CDeBc0', nativeToken: '0xfe27133f2e8c8539363883d914bccb4b21ebd28a' },
  },
  'beglobal': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x7883aD0e83ce50f4820a862EdB56f756599A3248', nativeToken: '0xcF958B53EC9340886d72bb4F5F2977E8C2aB64D3' },
  },
  'bigdataprotocol': {
    misrepresentedTokens: true,
    ethereum: { masterchef: '0x0De845955E2bF089012F682fE9bC81dD5f11B372', nativeToken: '0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 rewardPerShare)' },
  },
  'blackbird-finance': {
    misrepresentedTokens: true,
    cronos: { masterchef: '0xDF937094C6f2B757Dfd1265e5e1550Ea0055b27A', nativeToken: '0x9A3d8759174f2540985aC83D957c8772293F8646' },
  },
  'BoneSwap': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x7fB524301283BCc0dEf0FaECc19c490bCEeB67AC', nativeToken: '0x16d0046597b0E3B136CDBB4edEb956D04232A711', useDefaultCoreAssets: true, lps: ['0x552de336afae1cd17bf1df517403f686f550f21e', '0x5704d76389bfbde1ab2b642ed9ea720bace88cc9'] },
  },
  'boobs-fi': {
    misrepresentedTokens: true,
    base: { masterchef: '0xF40E05313592008Def7B7e247fbe1177aE902c5A', nativeTokens: ['0x66b70221b22925c4663C46cd15f2f2EaaC822CEB'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'boom': {
    misrepresentedTokens: true,
    polygon: { masterchef: '0x5102697d717793a071bc188773dd401d0b5c5f0b', nativeToken: '0xe88Ac56C4dedc973a0a26C062F0F07568dfb23FA', useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBoomPerShare)' },
  },
  'butterflyfinance': {
    misrepresentedTokens: true,
    avax: { masterchef: '0xab2ec5bDeEf83a457FBEA2d36f60443d668b0689', nativeToken: '0xbA5e6D1B37978c4fee748EEd33142171678DC840', useDefaultCoreAssets: true },
  },
  'camel-farm': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0xceFDbfaf8E0f5b52F57c435dAD670554aF57EBFF', nativeToken: '0xb5734ac76d44bdf32b8dd4331e5bfc3bf9989cda', coreAssets: [ADDRESSES.arbitrum.WETH] },
  },
  'cashcowprotocol': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x94098E24FCf4701237CF58ef2A222C1cF5003c86', nativeToken: '0xf823f18d13df1ffdced206708d389dd455bb802b' },
  },
  'catsapes': {
    misrepresentedTokens: true,
    kava: { masterchef: '0x85602B00C9bd973B1Afb66EC140A62480CF812d3' },
  },
  'ChirpFinance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x8d1e3458dA9E8a685732322D435178E790486651', nativeTokens: ['0xCa66B54a8A4AD9a231DD70d3605D1ff6aE95d427'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'chocobase': {
    misrepresentedTokens: true,
    base: { masterchef: '0x03B03cB12C3C9079BD6f1F155BD3348e99692d9b', nativeTokens: ['0x6d6080492D0Bd40F1e44cc16791CC1664357f685'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'chocoInu-masterchef': {
    misrepresentedTokens: true,
    shibarium: { masterchef: '0x100A30e31aa03ed85F0854712a1Dff0880e960BE', nativeTokens: ['0xC7cc176b2a098fF7cFd578C9eF0Cc8b1216C8ED1'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'ColaFactory': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x5Fe423A22d4bFD1caFd6044042f4269Fc930F8dC', nativeTokens: ['0x02Dff78fDeDaF86D9dfbe9B3132aA3Ea72Ed1680'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i, blacklistedTokens: ['0x9bd778df9b803a2df1fbe94ca9b5765cdb299a23'] },
  },
  'colors': {
    misrepresentedTokens: true,
    sonic: { masterchef: '0x392a46162b8dd7E6F1a34E4829043619B1f5a9f3', nativeToken: '0xd1F4414c66E5e046635A179143820f4CBf0D3D3b', poolInfoABI: 'function getPoolInfo(uint256 _pid) external view returns (address lpToken, uint256 _allocPoint)' },
  },
  'cookiebase-farm': {
    misrepresentedTokens: true,
    base: { masterchef: '0x0544b381F24eaC255ED1e2Ab2a67f10D2502921a', nativeTokens: ['0x614747C53CB1636b4b962E15e1D66D3214621100'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'cryptoyieldfocus': {
    misrepresentedTokens: true,
    hallmarks: [['2021-09-11', 'Rug Pull']],
    avax: { masterchef: '0xaB0141F81b3129f03996D0679b81C07F6A24c435', nativeToken: '0x411491859864797792308723Fc417f11BbA18D1b' },
  },
  'cupid': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xBCec0e5736614D8Bd05502A240526836bA0bBFc5', nativeToken: '0xD4C000c09bfeF49ABBd5c3728fcec3a42c68eBa1' },
  },
  'darkmatter': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x7C36c64811219CF9B797C5D9b264d9E7cdade7a4', nativeToken: '0x90E892FED501ae00596448aECF998C88816e5C0F', blacklistedTokens: ['0xaae8c712e9a3487e7b89d604181f2d29c4c48735'] },
  },
  'daytona-finance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0xAc6fBc06C8c0477ba8fc117adb52881c1Cc580dA', nativeTokens: ['0x9F8182aD65c53Fd78bd07648a1b3DDcB675c6772'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'dogeclaw': {
    misrepresentedTokens: true,
    okexchain: { masterchef: '0x1bb44D416620902a7f8AdF521422751A9f86d213', nativeToken: '0xc2f1a8570361DAA6994936d1Dd397e1434F2E2B3', useDefaultCoreAssets: true },
  },
  'dogepup': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0xc6dEcf90D8171B0E17f367C9f2fA4560C73845da', nativeTokens: ['0x1b15b9446b9f632a78396a1680DAaE17f74Ce8d9'], useDefaultCoreAssets: true },
  },
  'dogium-farm': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x579BACCd9DdF3D9e652174c0714DBC0CD4700dF2', nativeTokens: ['0x55bd2a3904c09547c3a5899704f1207ee61878be'], useDefaultCoreAssets: true },
  },
  'doorainu': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0xc98d9f2AD12D9813e1f76139b7ba7b84a1d2a878', nativeToken: '0xb7ffA0D35597d2e166384fc88Ed746a4c74be001', useDefaultCoreAssets: true },
  },
  'dracoforce': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x3D45191668dC53FFD60ea86F664716F4b320c372', nativeToken: '0x8d05B42749428C26613deB12f8989Cb8D1f5c17f' },
  },
  'dragonfruit': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x4bddb586DdD8F05b5C229BC66F5D71Ccb10e9a18', nativeTokens: ['0x2A3C691e08262aC2406aB9C3ee106C59Fff3E5ec'], useDefaultCoreAssets: true },
  },
  'dungeonswap': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x3720F1F9a02BFB4dD6afb9030eB826B4392D321F', nativeToken: '0x14c358b573a4ce45364a3dbd84bbb4dae87af034' },
  },
  'emumeme': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x99e1F72d10ad66906e18b02501e3395B8C4470FF', nativeToken: '0x0dfbB60c53d9226E8D70AA94eac614D8294D7Fa2', useDefaultCoreAssets: true },
  },
  'fantompup': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xCFD389eFCD11aB30933F46e493da08cE5ebAf233', nativeToken: '0x900825EA297c7c5D1F6fA54146849BC41EdDAf29' },
  },
  'frogswap-farm': {
    misrepresentedTokens: true,
    degen: { masterchef: '0xaB42EE05ceb48AC8f4d5782E4512D987694802b9', nativeTokens: ['0x7D4F462895AD2A6856cb6e94055B841C3cA55987'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'gemmine': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xf3C01F6D7ec85682FCAAfE438B8C6A3a54C7164C', nativeToken: '0x1e2a499fAefb88B2d085d7036f3f7895542b09De' },
  },
  'genesys': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x18cD511b4ad613308Bd0C795e85Fbd8BE1a0aF94', nativeToken: '0xf8b234a1ce59991006930de8b0525f9013982746' },
  },
  'jaguarswap': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0xAd60A8cb60e052196F5B968B4bd4328A67Df27d3', nativeToken: '0x31535F7A83083E3f34899F356ECC7246FBF2E82D' },
  },
  'jetmine': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xF7711748bF74f2dDC261e745Ff43FdD8abfD1200', nativeToken: '0x71BE8F5F245c1F5aa5727DFdB36aAD3C71a4c26b' },
  },
  'kafidao': {
    misrepresentedTokens: true,
    kava: { masterchef: '0x58a8E42C071b9C9d049F261E75DE5568Ef81a427', nativeToken: '0x254B63C7481A16bC4080f0Ab369320004f79Cca3', useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accKfdPerShare)' },
  },
  'kebab-finance': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x76FCeffFcf5325c6156cA89639b17464ea833ECd', nativeToken: '0x7979F6C54ebA05E18Ded44C4F986F49a5De551c2', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)' },
  },
  'knightsfantom': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x2166496575200E170310a34B5F697f7c124fF2C7', nativeToken: '0xba36266B6565C96BD77815fa898f403Cc06F64cf' },
  },
  'lavafall': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x04f9433A2CD21413Bc5641b84CaE0E40E86f9101', nativeToken: '0x7A0Ac775d290A7a3016f153d757Fbc3c4De62488' },
  },
  'maduck': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x944dFb7f7caB8bbA2F74882784742C39b8495F5e', nativeToken: '0xb976d9684412f75f7aee24e56d846fd404b1b329', useDefaultCoreAssets: true },
  },
  'mintswap': {
    misrepresentedTokens: true,
    avax: { masterchef: '0xAdD22604caf79139450e9fb4851394fFCE1692Be', nativeToken: '0x7bf4ca9aec25adaaf7278eedbe959d81893e314f' },
  },
  'mockingbird': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x7a7d80c024192E946C8931CcD325ECb2F42f8361', nativeToken: '0x0A737c40E42b164B30c0d3E5A19152CB89aA3EB9' },
  },
  'moneyrainfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xa1E756016D27E22eCA181D2dC1f6Bb462BbA199E', nativeToken: '0x9ce66Ef13D88cb1bC567E47459841483c5d9457C' },
  },
  'mymine': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x295cf2cC1e7236753EE6b280C066FcE5B22601be', nativeToken: '0x3d3121D2aeDff5e11E390027331CB544Bc3D2C59' },
  },
  'potluckprotocol': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x106804d24E0B7AB997D4b7Ab5cD5d8923C22707F', nativeToken: '0x49894fcc07233957c35462cfc3418ef0cc26129f' },
  },
  'PulseGun-farm': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0x1b9DD75c79Ef7308bC9aD449A9171fC5406403D8', nativeTokens: ['0xa39e7837B0c283e7ce07cfA7ca3DeEe58fbcbCd8'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'redemptionfi': {
    misrepresentedTokens: true,
    base: { masterchef: '0x5c6c79Ff5a58bBC3D7903f439b3A75415685eca3', nativeToken: '0x41E99e0F73a88947C52070FF67C19B7aBc171A54', useDefaultCoreAssets: true },
  },
  'Ringswap': {
    misrepresentedTokens: true,
    sonic: { masterchef: '0x51cbd201913dEC2C9714b340fDCf6530399bb89a', nativeTokens: ['0x4931CE8f4130a723cC6fF8A0B23B7F33550aB3a4'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'ryoshi': {
    misrepresentedTokens: true,
    dogechain: {
      masterchef: '0x206949295503c4FC5C9757099db479dD5383A5dC',
      nativeTokens: ['0xa4F9877A08F7639df15D506eAFF92Ab5E78273cd', '0xa98fa09D0BED62A9e0Fb2E58635b7C9274160dc7'],
      useDefaultCoreAssets: true,
      poolLengthAbi: 'uint256:poolCounter',
      poolInfoABI: 'function pools(uint256) view returns (address stakingToken, address rewardsToken, uint256 duration, uint256 finishAt, uint256 updatedAt, uint256 rewardRate, uint256 rewardPerTokenStored, uint256 totalSupply)',
      getToken: i => i.stakingToken === ADDRESSES.null ? ADDRESSES.dogechain.WWDOGE : i.stakingToken,
    },
  },
  'scarecrow': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xbCEf0849DDd928835A6Aa130aE527C2703CD832C', nativeToken: '0x46e1Ee17f51c52661D04238F1700C547dE3B84A1' },
  },
  'spectrefi': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x0a53F16a00c593cbe5F6C890E751338396FE680f', nativeToken: '0x2834d4F4cC40bd7D78c07E2D848358364222C272' },
  },
  'spiritfarm': {
    misrepresentedTokens: true,
    base: { masterchef: '0x26d7700c33e7d73BA0f135Ba901A1796d5474b85', nativeToken: '0xC7A148Ad554826b5308E100a05Fdb037DDa0bDe4', useDefaultCoreAssets: true },
  },
  'squidstake': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x86A47ddD4c6522251d6a5A5800f3F24c03332CB4', nativeToken: '0xAE61e7dc989718E700C046a2483e93513eDCA484' },
  },
  'statixfarm': {
    misrepresentedTokens: true,
    base: { masterchef: '0x32EeEd558c72Da99524E3b0176BCcbEd528cDFB2', nativeToken: '0xA28BAc0427e4a722246Ce4E9aD89Ec95FF8B87A3', useDefaultCoreAssets: true },
  },
  'sudoinu': {
    misrepresentedTokens: true,
    ethereum: { masterchef: '0x32E9BB1E0E03fdaC8131De202Be2f55AceDB349f', nativeTokens: ['0x93b743Fb12a2677adB13093f8eA8464A436DA008'], useDefaultCoreAssets: true, poolInfoABI: 'function poolToken(uint256) view returns (address)', getToken: i => i },
  },
  'thedragonslair': {
    misrepresentedTokens: true,
    avax: { masterchef: '0xC0F19836931F5Ab43f279D4DD5Ab3089846Db264', nativeToken: '0x88c090496125b751B4E3ce4d3FDB8E47DD079c57' },
  },
  'treedefi': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0xA9a438B8b2E41B3bf322DBA139aF9490DC226953', nativeTokens: ['0xf0fcd737fce18f95621cc7841ebe0ea6efccf77e', '0x40b34cc972908060d6d527276e17c105d224559d'] },
  },
  'trickortreat': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x2755AC6BD7BDbaCbdE08504f45f73D150Ee660F5', nativeToken: '0xA5aFce54270D9afA6a80464bBD383BE506888e6A' },
  },
  'undeadfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x18E84FEe58980473f6bEf65391e35eDC08C72af8', nativeToken: '0x89dD4d82F4aF70df521A76A4f0997b5Dc571917E' },
  },
  'unirexfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x75417a5647b88dc50f341cbed5db9ad6c3027ed5', nativeToken: '0x350a911687eb9710f1d36792f26d419577b127a8' },
  },
  'uniwswap-unia': {
    misrepresentedTokens: true,
    doublecounted: true,
    arbitrum: { masterchef: '0x231A584095dbFb73A0201d6573260Bc646566c98', nativeToken: '0xe547fab4d5ceafd29e2653cb19e6ae8ed9c8589b', useDefaultCoreAssets: true },
    ethpow: { masterchef: '0xC07707C7AC7E383CE344C090F915F0a083764C94', nativeToken: '0x2a0cf46ecaaead92487577e9b737ec63b0208a33', useDefaultCoreAssets: true },
  },
  'verified-credits': {
    misrepresentedTokens: true,
    kava: { masterchef: '0x0a3b0C346cEE826aa0eBEf78c1eBcB9BE07aD2eb' },
  },
  'veritable': {
    misrepresentedTokens: true,
    polygon: { masterchef: '0xE139E30D5C375C59140DFB6FD3bdC91B9406201c', nativeToken: '0x6397835430a5a5f8530F30C412CB217CE3f0943b', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accVRTPerShare)' },
  },
  'waterdendy': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0xD0834fF6122FF8dcf38E3eB79372C00FAeAFa08B', nativeToken: '0x88692aD37c48e8F4c821b71484AE3C2878C2A2C6', useDefaultCoreAssets: true },
  },
  'waterfallfinance': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x4Be7079064537867b40829119Be49Ee8CC76570e', nativeToken: '0x6b2a7B82d3F7a6e1F5A5831aB40666Ec717645d5' },
  },
  'wildbase': {
    misrepresentedTokens: true,
    base: { masterchef: '0x3eAB0C9716b0aA98CdC4c3ae317d69dE301ef247', nativeToken: '0xbCDa0bD6Cd83558DFb0EeC9153eD9C9cfa87782E', useDefaultCoreAssets: true },
  },
  'wtfdoge-farm': {
    misrepresentedTokens: true,
    dogechain: { masterchef: '0x03b487A2Df5ddc6699C545eB1Da27D843663C8b8', nativeToken: '0xeF7B2204B5c4DCe2b30600B89e1C11bb881f3564', useDefaultCoreAssets: true, lps: ['0x62b44635A4AeBcA4D329AdD86BC34d00869eF4d2', '0x52d8E261cfdc7E62e783611b0bB6a3064dF9FC05'] },
  },
  'xbluefinance': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0xd139490F63d220CacA960DA9E40Ad59Fc3AdcB15', nativeToken: '0x50AA7A13B28EeA97dc6C3f5E8aaa7fE512e7306D', useDefaultCoreAssets: true },
  },
  'xmaspast': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0x138c4dB5D4Ab76556769e4ea09Bce1D452c2996F', nativeToken: '0xD3111Fb8BDf936B11fFC9eba3b597BeA21e72724' },
  },
  'YieldPulseFinance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0xc9649cd27cFe8D74a47D711e04fEF3AbC4B56bae', nativeTokens: ['0xDd40a166b43c0b95F1248c9A5AFFD7A166f1526a'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },
  'YogurtFinance': {
    misrepresentedTokens: true,
    pulse: { masterchef: '0xca3E704Bd09B979170D76d34880c7A72fda51B63', nativeTokens: ['0xece11C704F38FF38520667AeCDd7f53eA82F60F5'], useDefaultCoreAssets: true, poolInfoABI: 'function poolInfo(uint256) view returns (address)', getToken: (i) => i },
  },

  // ============================================================
  // Multi-masterchef adapters (previously using mergeExports)
  // ============================================================
  'magicland': {
    misrepresentedTokens: true,
    arbitrum: { masterchef: '0x6b614684742717114200dc9f30cBFdCC00fc73Ec', nativeToken: '0x2c852d3334188be136bfc540ef2bb8c37b590bad' },
    iotex: { masterchef: '0x9B4CF5d754455fD3Bc4212DCFF1b085DBCd5b0c0' },
  },
  'ester': {
    misrepresentedTokens: true,
    fantom: { masterchef: '0xA6151b608f49Feb960e951F1C87F4C766850de31', nativeToken: '0x181f3f22c9a751e2ce673498a03e1fdfc0ebbfb6', poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accESTPerShare, address strat)' },
  },
  'tenet': {
    misrepresentedTokens: true,
    ethereum: { masterchef: '0xdA842fad0BDb105c88399e845aD4D00dE3AEb911', nativeToken: '0x74159651a992952e2bf340d7628459aa4593fc05', poolInfoABI: 'function poolSettingInfo(uint256) view returns (address lpToken, address tokenAddr, address projectAddr, uint256 tokenAmount, uint256 startBlock, uint256 endBlock, uint256 tokenPerBlock, uint256 tokenBonusEndBlock, uint256 tokenBonusMultipler)' },
    bsc: { masterchef: '0x3F4c79EB1220BeBBf5eF4B3e7c59E5cf38200b62', nativeToken: '0xdFF8cb622790b7F92686c722b02CaB55592f152C', poolInfoABI: 'function poolSettingInfo(uint256) view returns (address lpToken, address tokenAddr, address projectAddr, uint256 tokenAmount, uint256 startBlock, uint256 endBlock, uint256 tokenPerBlock, uint256 tokenBonusEndBlock, uint256 tokenBonusMultipler)' },
  },
  'salem': {
    misrepresentedTokens: true,
    cronos: { masterchef: '0xBD124D3B18a382d807a9E491c7f1848403856B08', nativeToken: '0x637CB66526244029407046867E1E0DFD28b2294E' },
    fantom: { masterchef: '0xdA2A9024D8D01F4EA0aa35EEdf771432095219ef', nativeToken: '0xa26e2D89D4481500eA509Df58035073730cff6D9' },
    polygon: { masterchef: '0x53D392646faB3caE0a08Ead31f8B5cBFFf55b818', nativeToken: '0xf5291e193aad73cac6fd8371c98804a46c6c6577' },
  },
  'rbx': {
    misrepresentedTokens: true,
    bsc: { masterchef: '0x864d434308997e9648838d23f3eedf5d0fd17bea', blacklistedTokens: ['0xa9639160481b625ba43677be753e0a70bf58c647'], nativeToken: '0xace3574b8b054e074473a9bd002e5dc6dd3dff1b' },
    ethereum: { masterchef: '0x50b641caab809c1853be334246ac951faccc49b0', nativeToken: '0x8254e26e453EB5aBd29B3c37AC9E8Da32E5d3299' },
  },
  'parrotegg': {
    misrepresentedTokens: true,
    iotex: { masterchef: '0x83E7e97C4e92D56c0653f92d9b0c0B70288119b8', nativeToken: '0x176cb5113b4885b3a194bd69056ac3fe37a4b95c' },
    harmony: { masterchef: '0xFb15945E38a11450AF5E3FF20355D71Da72FfE8a', nativeToken: '0xC36769DFcDF05B2949F206FC34C8870707D33C89' },
    arbitrum: { masterchef: '0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311', nativeToken: '0x78055dAA07035Aa5EBC3e5139C281Ce6312E1b22' },
    polygon: { masterchef: '0x34E4cd20F3a4FdC5e42FdB295e5A118D4eEB0b79', nativeToken: '0xB63E54F16600b356f6d62dDd43Fca5b43d7c66fd' },
  },
  'koala-defi': {
    misrepresentedTokens: true,
    polygon: { masterchef: '0xf6948f00FC2BA4cDa934C931628B063ed9091019', nativeToken: '0x04f2e3ec0642e501220f32fcd9e26e77924929a9' },
    bsc: { masterchef: '0x7b3cA828e189739660310B47fC89B3a3e8A0E564', nativeToken: '0xb2ebaa0ad65e9c888008bf10646016f7fcdd73c3' },
  },
  'HoneyFarm': {
    misrepresentedTokens: true,
    avax: { masterchef: '0x757490104fd4C80195D3C56bee4dc7B1279cCC51', nativeToken: '0xB669c71431bc4372140bC35Aa1962C4B980bA507', blacklistedTokens: ['0x1ce0c2827e2ef14d5c4f29a091d735a204794041'] },
    bsc: { masterchef: '0x88E21dedEf04cf24AFe1847B0F6927a719AA8F35', nativeToken: '0x1A8d7AC01d21991BF5249A3657C97b2B6d919222' },
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
