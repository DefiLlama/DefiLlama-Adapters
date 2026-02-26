const ADDRESSES = require('../projects/helper/coreAssets.json')
const { aaveV2Export, aaveExports, methodology } = require('../projects/helper/aave')
const { buildProtocolExports } = require('./utils')

const chainExportKeys = new Set(['staking', 'pool2', 'borrowed', 'vesting'])

function aaveV2ExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      result[chain] = aaveV2Export(config)
    } else {
      const { registry, ...options } = config
      for (const key of chainExportKeys) delete options[key]
      result[chain] = aaveV2Export(registry, options)
    }
  })
  return result
}

function aaveExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      result[chain] = aaveExports(chain, config)
    } else {
      const { addressesProviderRegistry, dataHelpers, ...options } = config
      for (const key of chainExportKeys) delete options[key]
      result[chain] = aaveExports(chain, addressesProviderRegistry, undefined, dataHelpers, options)
    }
  })
  return result
}

// --- aaveV2Export based protocols ---
const aaveV2Configs = {
  'test-alert-unlisted': {
    methodology,
    somnia: { registry: '0xEC6758e6324c167DB39B6908036240460a2b0168', isAaveV3Fork: true },
  },
  'tokos-fi': {
    methodology,
    somnia: { registry: '0xEC6758e6324c167DB39B6908036240460a2b0168', isAaveV3Fork: true },
  },
  'pholend': {
    methodology,
    crossfi: '0x09e7b6BF92ba8566939d59fE3e3844385d492E77',
  },
  'hydration-lending': {
    methodology,
    hydradx: {
      registry: '0x1b02E051683b5cfaC5929C25E84adb26ECf87B38',
      abis: {
        getReserveData: "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
      },
    },
  },
  'dorian': {
    methodology,
    core: {
      registry: '0x29604bF5D09bcb714D13549f98CC4Bb49c2Ff672',
      fromBlock: 15251455,
      staking: ['0x3C57d20A70d4D34331d442Cd634B0ccAF6Ad89A4', '0x6191F90724cD0aa791B7476e804ae00146618Ab6'],
    },
  },
  'klaybank': {
    klaytn: {
      registry: '0x4B6Ece52D0EF60aE054f45c45D6bA4F7a0C2cC67',
      staking: ['0x32FE0F8d0BC59836028E80bc2ed94AE8E169344B', '0x946bc715501413b9454bb6a31412a21998763f2d'],
    },
  },
  'unleash': {
    methodology,
    sty: { registry: '0xC62Af8aa9E2358884B6e522900F91d3c924e1b38', isAaveV3Fork: true, isInsolvent: true },
  },
  'lendle': {
    mantle: {
      registry: '0x30D990834539E1CE8Be816631b73a534e5044856',
      fromBlock: 56556,
      staking: ['0x5C75A733656c3E42E44AFFf1aCa1913611F49230', '0x25356aeca4210eF7553140edb9b8026089E49396'],
    },
  },
  // --- newly migrated aaveV2Export protocols ---
  'bonzo': {
    timetravel: false,
    methodology,
    hedera: '0x236897c518996163E7b313aD21D1C9fCC7BA1afc',
  },
  'takoTako': {
    methodology,
    taiko: {
      registry: '0xD07B62ee683267D4A884453eaE982A151653515E',
      fromBlock: 381054,
      blacklistedTokens: ['0xf7fb2df9280eb0a76427dc3b34761db8b1441a49'],
    },
  },
}

// --- aaveExports based protocols ---
const aaveConfigs = {
  'the-granary': {
    methodology,
    fantom: '0x773E0277667F0c38d3Ca2Cf771b416bfd065da83',
    avax: '0xC043BA54F34C9fb3a0B45d22e2Ef1f171272Bc9D',
    optimism: '0x872B9e8aea5D65Fbf29b8B05bfA4AA3fE94cC11f',
    ethereum: '0x5C93B799D31d3d6a7C977f75FDB88d069565A55b',
    metis: '0x37133A8dCA96400c249102E59B11e25b0F663Ee0',
    arbitrum: '0x512f582fFCCF3C14bD872152EeAe60866dCB2A1e',
    bsc: '0x7c8E7536c5044E1B3693eB564C6dE3a3CE58bbDa',
    base: '0x5C93B799D31d3d6a7C977f75FDB88d069565A55b',
  },
  'aave-arc': {
    ethereum: {
      addressesProviderRegistry: '0x6FdfafB66d39cD72CFE7984D3Bbcc76632faAb00',
      dataHelpers: ['0x71B53fC437cCD988b1b89B1D4605c3c3d0C810ea'],
    },
  },
  'luckypeaches': {
    hemi: { dataHelpers: ['0x986b04d0a228b8cB81E236F9Add85e43758F21B2'] },
    hyperliquid: { dataHelpers: ['0x473f5e779b36DdC54f63107B255580Db049EFc5b'] },
  },
  'seamless': {
    methodology,
    base: {
      addressesProviderRegistry: '0x90C5055530C0465AbB077FA016a3699A3F53Ef99',
      dataHelpers: ['0x2A0979257105834789bC6b9E1B00446DFbA8dFBa'],
      v3: true,
    },
  },
  'hyperlend': {
    hyperliquid: {
      addressesProviderRegistry: '0x24E301BcBa5C098B3b41eA61a52bFe95Cb728b20',
      dataHelpers: ['0x5481bf8d3946E6A3168640c1D7523eB59F055a29'],
      v3: true,
    },
  },
  'radiant': {
    methodology,
    arbitrum: {
      addressesProviderRegistry: '0x7BB843f889e3a0B307299c3B65e089bFfe9c0bE0',
      staking: ['0xc2054A8C33bfce28De8aF4aF548C48915c455c13', '0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017'],
      pool2: ['0xc963ef7d977ECb0Ab71d835C4cb1Bf737f28d010', '0x24704aFF49645D32655A76Df6d407E02d146dAfC'],
    },
  },
  'phiat': {
    methodology,
    pulse: {
      addressesProviderRegistry: '0x9B979a359410544236343Dfa11b8e1401e4DdCd6',
      staking: ['0xeAa92F835757a8B3fA4cbCA3Db9D2Ea342651D44', '0x96e035ae0905efac8f733f133462f971cfa45db1'],
    },
  },
  'sculptor-finance': {
    methodology,
    bsc: {
      addressesProviderRegistry: '0xa1eBB37b5A19050A192c38C82f25f4aBf0158F39',
      staking: ['0xd4F7F739488f5C9930A60e85afbE26a8B71BA795', '0xAd3E02e83b886543D1171FF446C130D52068C106'],
      pool2: ['0x18542eEe45272a29BC572F0EdB727da4e3506DD2', '0xB1F3bE619648B4a2dF6ddaCFD42B051F21bF3dc8'],
    },
  },
  'valas': {
    methodology,
    bsc: {
      addressesProviderRegistry: '0x99E41A7F2Dd197187C8637D1D151Dc396261Bc14',
      blacklistedTokens: [ADDRESSES.bsc.BUSD, ADDRESSES.bsc.BTUSD],
      staking: ['0x685D3b02b9b0F044A3C01Dbb95408FC2eB15a3b3', '0xB1EbdD56729940089Ecc3aD0BBEEB12b6842ea6F'],
      pool2: ['0x3eB63cff72f8687f8DE64b2f0e40a5B95302D028', '0x829F540957DFC652c4466a7F34de611E172e64E8'],
    },
  },
  'betterbank': {
    pulse: {
      addressesProviderRegistry: '0x21597Ae2f941b5022c6E72fd02955B7f3C87f4Cb',
      dataHelpers: ['0x2369cf50ee0e5727bd971c0d2d172ea6f376edaa'],
      v3: true,
      isInsolvent: true,
    },
  },
  'spark-fi': {
    ethereum: {
      addressesProviderRegistry: '0x03cFa0C4622FF84E50E75062683F44c9587e6Cc1',
      dataHelpers: ['0xFc21d6d146E6086B8359705C8b28512a983db0cb'],
      v3: true,
      staking: ['0xc6132FAF04627c8d05d6E759FAbB331Ef2D8F8fD', '0xc20059e0317DE91738d13af027DfC4a50781b066'],
    },
    xdai: {
      addressesProviderRegistry: '0xA98DaCB3fC964A6A0d2ce3B77294241585EAbA6d',
      dataHelpers: ['0x2a002054A06546bB5a264D57A81347e23Af91D18'],
      v3: true,
    },
  },
  // --- newly migrated aaveExports protocols ---
  'palomino-finance': {
    methodology,
    saga: {
      dataHelpers: ['0x96a5A828c554b4D5ACdb9f0f4bb15b24C0423B69'],
      v3: true,
      blacklistedTokens: ['0xB76144F87DF95816e8c55C240F874C554B4553C3'],
    },
  },
  'haven1-hlend': {
    methodology: "Counts the tokens locked in Haven1 contracts that are used as collateral or to generate yield. Borrowed tokens are excluded, so only assets directly locked in the protocol are counted. This prevents inflating TVL through recursive lending.",
    haven1: {
      addressesProviderRegistry: '0x989CdA7ea2953F9AF743C7cc51B8fA71d156aE27',
      dataHelpers: ['0x91e097513f45D4aA93E6acBa20272AA769fa9D27'],
      v3: true,
    },
  },
  'bitfire': {
    methodology,
    mezo: {
      addressesProviderRegistry: '0xD489a9cc2eF0b990c6a30Ed9AfF6EC63A2765F25',
      dataHelpers: ['0xBB7cF099BAfc69a30D4f21878F2FE3Ac10e768fA'],
      v3: true,
      abis: {
        getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
  'betterlend': {
    pulse: {
      addressesProviderRegistry: '0x6a52A961CF2241Cca78F8e5Fdc980a824afD6d8c',
      dataHelpers: ['0x1847a4e03D02cf2b86614153Eb76432fF499C732'],
      v3: true,
    },
  },
  'quokkalend': {
    morph: {
      addressesProviderRegistry: '0x8C28AAA6c07c6c4e3E68B2e426C847614A9c0Dea',
      dataHelpers: ['0x367ab6F3e883617f8385Eb5eA9d6e41A6e5c0D35'],
    },
  },
  'lendOS': {
    methodology,
    neon_evm: {
      dataHelpers: ['0x3A1ca459F21D8FAcF9A30bC4773f5dBf07C1191d'],
      v3: true,
    },
    hemi: {
      dataHelpers: ['0xfBF6Aab10f696F3BA098BBE4EA9CF2503FC0f358'],
      v3: true,
    },
  },
  'kinza': {
    methodology,
    bsc: {
      addressesProviderRegistry: '0x37D7Eb561E189895E5c8601Cd03EEAB67C269189',
      dataHelpers: ['0x09ddc4ae826601b0f9671b9edffdf75e7e6f5d61'],
      v3: true,
    },
    op_bnb: {
      addressesProviderRegistry: '0xcf46F77cD75a17900d59676fBe4B88aAdcBA9533',
      dataHelpers: ['0xBb5f2d30c0fC9B0f71f7B19DaF19e7Cf3D23eb5E'],
      v3: true,
    },
    mantle: {
      addressesProviderRegistry: '0xad48812a9d81aCf8De5bfc93c7d6d7165920aBc2',
      dataHelpers: ['0x18cc2c55b429EE08748951bBD33FF2e68c95ec38'],
      v3: true,
    },
    ethereum: {
      addressesProviderRegistry: '0x37c9E6eEAbE799878FF9d32984A3a0b91243cbC6',
      dataHelpers: ['0xE44990a8a732605Eddc0870597d2Cf4A2637F038'],
      v3: true,
    },
  },
  'jolt': {
    methodology,
    optimism: {
      addressesProviderRegistry: '0x3d8a1ea95ea4afa2469bfb80d94a4f9068670e82',
      dataHelpers: ['0xe9c0EFeA9236467fa9aaC41E2c728aD47aaD74d3'],
    },
  },
  'hypurrfi': {
    methodology,
    hyperliquid: {
      dataHelpers: ['0x48684a2316eac7b458ad22c459e12eb1c0fa28c4'],
      v3: true,
    },
  },
  'harbor': {
    bsc: '0x31406A8c12813b64bF9985761BA51412B92fFb4E',
  },
  'extra-xlend': {
    optimism: {
      dataHelpers: ['0xCC61E9470B5f0CE21a3F6255c73032B47AaeA9C0'],
      v3: true,
    },
    base: {
      dataHelpers: ['0x1566DA4640b6a0b32fF309b07b8df6Ade40fd98D'],
      v3: true,
    },
  },
  'dtrinity-dlend': {
    methodology,
    fraxtal: {
      dataHelpers: ['0xFB3adf4c845fD6352D24F3F0981eb7954401829c'],
      v3: true,
      blacklistedTokens: ['0x788D96f655735f52c676A133f4dFC53cEC614d4A'],
    },
    sonic: {
      dataHelpers: ['0xB245F8321E7a4938DEf8bDb2D5E2E16481268c42'],
      v3: true,
      blacklistedTokens: ['0x53a6aBb52B2F968fA80dF6A894e4f1b1020DA975', '0x614914B028A7D1fD4Fab1E5a53a3E2dF000bcB0e'],
    },
  },
  'apebank': {
    apechain: '0xEeec4D3C3aa8B4B2589b6a076717e5B045f7F0E9',
  },
  'yieldlend': {
    base: {
      dataHelpers: ['0x43A5803c5f1Cb6241858669ad6F63fe5B3882434'],
    },
  },
  'u235': {
    methodology,
    scroll: {
      addressesProviderRegistry: '0xE58Ebf93885c8Ea0368fCe84aF79EC983b80c8D5',
      dataHelpers: ['0xeB3C203418f0cb55b351C3E45A5C4f47bE5DA77A'],
      v3: true,
    },
  },
  'tropykus-zkevm': {
    methodology,
    polygon_zkevm: '0x4Dac514F520D051551372d277d1b2Fa3cF2AfdFF',
  },
  'superlend': {
    methodology,
    etlk: {
      addressesProviderRegistry: '0xEcbDd440C7a929d7524784Af634dF9EB0747b9e7',
      dataHelpers: ['0x99e8269dDD5c7Af0F1B3973A591b47E8E001BCac'],
      v3: true,
    },
  },
  'sio2': {
    methodology,
    astar: {
      addressesProviderRegistry: '0x9D8bB85b1c728f69672923dD4A0209EC8b75EFda',
      abis: {
        getAllATokens: "function getAllSTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
  'seismic': {
    methodology,
    blast: '0xEEcA436A6d4AfF6f0d55d71e9B1C271AbF511Cd0',
  },
  'roe': {
    ethereum: {
      addressesProviderRegistry: '0x0029B254d039d8C5C88512a44EAa6FF999296009',
      dataHelpers: ['0xC68A4F7764f5219f250614d5647258a17A51a6c7'],
    },
    polygon: {
      addressesProviderRegistry: '0x1ceb99Acd9788bb7d7Ce4a90219cBb0627b008F9',
      dataHelpers: ['0xA0132fF55E4ee9818B2F2d769f6Ba5c14Cfe0DA4'],
    },
    arbitrum: {
      addressesProviderRegistry: '0x01b76559D512Fa28aCc03630E8954405BcBB1E02',
      dataHelpers: ['0x156a166B58afB948f4c60e1DC6bEdFF55760c319'],
    },
  },
  'rhombus': {
    klaytn: {
      dataHelpers: ['0x3eFC37753ec2501b406F3443cFD8D406B52abEa6'],
      v3: true,
    },
  },
  'realtoken-rmm-v3': {
    methodology,
    xdai: {
      addressesProviderRegistry: '0xC6c4b123e731819AC5f7F9E0fe3A118e9b1227Cd',
      dataHelpers: ['0x11B45acC19656c6C52f93d8034912083AC7Dd756'],
    },
  },
  'realtmarkets': {
    misrepresentedTokens: true,
    methodology,
    xdai: {
      addressesProviderRegistry: '0xae6933231Fb83257696E29B050cA6068D6E6Cc84',
      oracle: '0x1a88d967936a73326562d2310062eCE226Ed6664',
    },
  },
  'pu239': {
    methodology,
    map: {
      addressesProviderRegistry: '0x0fBB7d9866D357f75a8fAf83330b7d089703464e',
      dataHelpers: ['0xa9fc4Ea8A1dE8C722D8a70a73f26E2DBD89475bd'],
      v3: true,
    },
  },
  'palmy': {
    methodology,
    oas: {
      addressesProviderRegistry: '0xf4A3dDC5F629d9CB14DF4e7d5f78326153eA02A3',
      abis: {
        getAllATokens: "function getAllLTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
  'mooncakefi': {
    linea: {
      dataHelpers: ['0x593C2d762B1CDe79101D946Ca7816eeaF17Ad744'],
    },
    base: {
      dataHelpers: ['0x32aB5e8ad83d4afbEe7103d7ed4A9CAF7B76F195'],
    },
  },
  'monolend': {
    methodology,
    polygon: '0x49Ce0308F3F55955D224453aECe7610b6983c123',
  },
  'molend': {
    mode: '0xB6796E12ADC78993DB1a33Cedbc459a4A848ED69',
  },
  'mahalend': {
    ethereum: {
      dataHelpers: ['0xCB5a1D4a394C4BA58999FbD7629d64465DdA70BC'],
    },
    arbitrum: {
      dataHelpers: ['0xE76C1D2a7a56348574810e83D38c07D47f0641F3'],
    },
  },
  'lore': {
    scroll: '0xBc6DE4458b7D6fbf82240ce8cC0CA6a2f4986eb5',
  },
  'iolend': {
    methodology,
    iotaevm: '0xA9Bb7ebb4F51B0e0BbD0FaE640e32298a0Bcf4A5',
  },
  'hana-finance': {
    taiko: {
      addressesProviderRegistry: '0x47EC2cEF8468dbaC060410E2BDde35A3B8f725e5',
      dataHelpers: ['0x9E3D95b518f68349464da1b6dbd0B94DB59addc1'],
    },
  },
  'hadouken-fi-lending': {
    godwoken_v1: '0x10797360711178183455cCa40533FfB62a17C60f',
  },
  'glyph-fi': {
    fraxtal: '0xcD0c5BA79018F37898A58eF56d197828d84f36Ad',
  },
  'fathom-lending': {
    xdc: {
      addressesProviderRegistry: '0xDAb3B99eb3569466750c436d6F4c99d57850Cc89',
      dataHelpers: ['0x7fa488a5C88E9E35B0B86127Ec76B0c1F0933191'],
      v3: true,
      abis: {
        getAllATokens: "function getAllFmTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
  'amply-finance': {
    methodology,
    cronos_zkevm: {
      dataHelpers: ['0x47656eb2A31094b348EBF458Eccb942d471324eD'],
      v3: true,
    },
  },
  'magsinio': {
    sonic: '0x67389503F9EF03D5C10074dEfd96E18bc7755194',
  },
  'meridian-lend': {
    telos: {
      addressesProviderRegistry: '0xb84171C0824B4F3C0B415706C99A4A8ED5779b75',
      abis: {
        getAllATokens: "function getAllOTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    meter: {
      addressesProviderRegistry: '0x64Be9ee529E555860DA0705819138F41247e76E6',
      abis: {
        getAllATokens: "function getAllOTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    fuse: {
      addressesProviderRegistry: '0xbdD3d2f93cc1c6C951342C42Ef0795323CE83719',
      abis: {
        getAllATokens: "function getAllOTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    taiko: {
      addressesProviderRegistry: '0x8Cf3E0e7aE4eB82237d0931388EA72D5649D76e0',
      abis: {
        getAllATokens: "function getAllOTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    tara: {
      addressesProviderRegistry: '0x96a52CdFE64749C146E13F68641073566275433e',
      abis: {
        getAllATokens: "function getAllOTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
  'blend-finance': {
    methodology,
    bevm: {
      addressesProviderRegistry: '0x6aB5d5E96aC59f66baB57450275cc16961219796',
      dataHelpers: ['0x5F314b36412765f3E1016632fD1Ad528929536CA'],
      v3: true,
      isInsolvent: true,
      abis: {
        getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    occ: {
      addressesProviderRegistry: '0x58cCCdafe3B0DE4cB94d35F9CcC0680E4199C06B',
      dataHelpers: ['0xf444a0333DAa67efC5b1C2c0B79F435dd0f652a9'],
      v3: true,
      isInsolvent: true,
      abis: {
        getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    arbitrum: {
      addressesProviderRegistry: '0xD489a9cc2eF0b990c6a30Ed9AfF6EC63A2765F25',
      dataHelpers: ['0xBB7cF099BAfc69a30D4f21878F2FE3Ac10e768fA'],
      v3: true,
      isInsolvent: true,
      abis: {
        getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
    base: {
      addressesProviderRegistry: '0xD489a9cc2eF0b990c6a30Ed9AfF6EC63A2765F25',
      dataHelpers: ['0xBB7cF099BAfc69a30D4f21878F2FE3Ac10e768fA'],
      v3: true,
      isInsolvent: true,
      abis: {
        getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
  'starlay': {
    methodology,
    astar: {
      addressesProviderRegistry: '0xF6206297b6857779443eF7Eca4a3cFFb1660F952',
      isInsolvent: true,
      abis: {
        getAllATokens: "function getAllLTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
      staking: ['0xDf32D28c1BdF25c457E82797316d623C2fcB29C8', ADDRESSES.astar.LAY],
    },
    acala: {
      addressesProviderRegistry: '0xA666dD28059deF0B45505c1f1a5f49fAd2e03c11',
      isInsolvent: true,
      abis: {
        getAllATokens: "function getAllLTokens() view returns (tuple(string symbol, address tokenAddress)[])",
      },
    },
  },
}

module.exports = {
  ...buildProtocolExports(aaveV2Configs, aaveV2ExportFn),
  ...buildProtocolExports(aaveConfigs, aaveExportFn),
}
