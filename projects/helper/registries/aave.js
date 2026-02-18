const ADDRESSES = require('../coreAssets.json')
const { aaveV2Export, aaveExports, methodology } = require('../aave')
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
}

module.exports = {
  ...buildProtocolExports(aaveV2Configs, aaveV2ExportFn),
  ...buildProtocolExports(aaveConfigs, aaveExportFn),
}
