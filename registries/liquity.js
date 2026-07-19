const ADDRESSES = require('../projects/helper/coreAssets.json')
const { getLiquityTvl, getLiquityV2Tvl } = require('../projects/helper/liquity')
const { buildProtocolExports } = require('./utils')

// Chain config forms:
//   - string: trove manager address
//   - { troveManager, collateralToken?, nonNativeCollateralToken?, abis? }
//   - { troveManagers: [{ troveManager, collateralToken?, ... }, ...] } : multiple troves summed
//   - null / {} : empty TVL chain (returns {})
// staking / pool2 (array params) are handled by buildProtocolExports
//
// _options.helperType: 'v2' switches to getLiquityV2Tvl. For v2, chain config is:
//   - string: collateral registry address
//   - [address, ...] : multiple collateral registries summed
//   - { collateralRegistries: [...], abis? } / { collateralRegistry, abis? }
//   - null / {} : empty TVL chain
function liquityExportFn(chainConfigs, options = {}) {
  if (options.helperType === 'v2') return liquityV2ExportFn(chainConfigs)
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (config === null || config === undefined) {
      result[chain] = { tvl: () => ({}) }
      return
    }
    if (typeof config === 'string') {
      result[chain] = { tvl: getLiquityTvl(config) }
      return
    }
    if (Array.isArray(config.troveManagers)) {
      result[chain] = { tvl: getLiquityTvl(config.troveManagers) }
      return
    }
    const { troveManager, collateralToken, nonNativeCollateralToken, abis } = config
    if (!troveManager) {
      result[chain] = { tvl: () => ({}) }
      return
    }
    result[chain] = { tvl: getLiquityTvl(troveManager, { collateralToken, nonNativeCollateralToken, abis }) }
  })
  return result
}

function liquityV2ExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (config === null || config === undefined) {
      result[chain] = { tvl: () => ({}) }
      return
    }
    if (typeof config === 'string' || Array.isArray(config)) {
      result[chain] = { tvl: getLiquityV2Tvl(config) }
      return
    }
    const { collateralRegistry, collateralRegistries, abis } = config
    const registries = collateralRegistries ?? collateralRegistry
    if (!registries) {
      result[chain] = { tvl: () => ({}) }
      return
    }
    result[chain] = { tvl: getLiquityV2Tvl(registries, { abis }) }
  })
  return result
}

const configs = {
  'alternity': {
    start: '2023-08-19',
    ethereum: {
      troveManager: '0x51c014510A5AdA43408b40D49eF52094014ef3A7',
      staking: ['0x424891f1D6D4De5c07B6E3F74B3709D6BD9E77ea', '0xD1ffCacFc630CE68d3cd3369F5db829a3ed01fE2'],
    },
  },
  'aquarius': {
    methodology: `Aquarius does not run its own web interface deposits for it's TVL are made at third-party frontend operators incetivized with the AQU token. TVL consists of deposits made to mint aUSD.`,
    fantom: '0xC87D230B3239d1A90463463d8adDFD70709D391b',
  },
  'bookusd': {
    start: '2025-04-26',
    bsc: {
      troveManager: '0xFe5D0aBb0C4Addbb57186133b6FDb7E1FAD1aC15',
      staking: ['0xD8eC53945788C2bC8990828a46fb2f408D8C3a17', '0xfC35Bf79270bCad22Ce7dd5651Aa2435fce9b7C5'],
    },
  },
  'defihalal': {
    methodology: 'Deposited Matic and USDH, USDH is not listed on CoinGecko and has been replaced with TUSD',
    polygon: '0xd8a3e8c70091d6231a63e671a6ce8ea44e143d24',
  },
  'fluity': {
    bsc: '0xe041c4099C0d6dcfC52C56A556EE4289D2E4b7C5',
  },
  'money-protocol': {
    rsk: '0xb6A3E678219D9119Ae3B65AC501638b986b5038b',
  },
  'hliquity': {
    start: '2024-06-05',
    methodology: 'Total deposits of HBAR for borrowed HCHF',
    hedera: {
      troveManager: '0x00000000000000000000000000000000005c9f66',
      staking: ['0x00000000000000000000000000000000005c9f30', '0x00000000000000000000000000000000005c9f70'],
    },
  },
  'liquidloans-io': {
    pulse: {
      troveManager: '0xD79bfb86fA06e8782b401bC0197d92563602D2Ab',
      staking: ['0x853F0CD4B0083eDf7cFf5Ad9A296f02Ffb71C995', '0x9159f1D2a9f51998Fc9Ab03fbd8f265ab14A1b3B'],
    },
  },
  'liquity': {
    start: '2021-04-05',
    ethereum: {
      troveManager: '0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2',
      staking: ['0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d', '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D'],
    },
  },
  'meridian': {
    methodology: 'Deposited Collateral on Meridian Mint',
    base: {
      troveManager: '0x56a901FdF67FC52e7012eb08Cfb47308490A982C',
      staking: ['0xfCcD02F7a964DE33032cb57746DC3B5F9319eaB7', '0x2F3b1A07E3eFb1fCc64BD09b86bD0Fa885D93552'],
    },
    telos: {
      troveManager: '0xb1F92104E1Ad5Ed84592666EfB1eB52b946E6e68',
      staking: [['0x493A60387522a7573082f0f27B98d78Ca8635e43', '0xE07D7f1C1153bCebc4f772C48A8A8eed1283ecCE'], '0x568524DA340579887db50Ecf602Cd1BA8451b243'],
    },
    fuse: {
      troveManager: '0xCD413fC3347cE295fc5DB3099839a203d8c2E6D9',
      staking: ['0xb513fE4E2a3ed79bE6a7a936C7837f0294AFFEAd', '0x2363Df84fDb7D4ee9d4E1A15c763BB6b7177eAEe'],
    },
    tara: null,
    artela: null,
  },
  'mezo-borrow': {
    start: '2025-05-12',
    mezo: '0x94AfB503dBca74aC3E4929BACEeDfCe19B93c193',
  },
  'orby-network': {
    cronos: {
      troveManager: '0x7a47cf15a1fcbad09c66077d1d021430eed7ac65',
      collateralToken: '0x7a7c9db510aB29A2FC362a4c34260BEcB5cE3446',
    },
  },
  'xdollar-finance': {
    hallmarks: [
      ['2022-10-30', 'XUSD is no longer counted as part of tvl'],
    ],
    iotex: {
      troveManagers: [
        ...[
          '0x9831a3BF768f32202bBFA5369F888DC88CB31b41',
          '0x511D2869910ECE987095eCb5aB4b58c38213Ed51',
          '0x0BD0cdBf61975f4Cc3E77f595dA8CE4F5f559D0e',
          '0x705CA68990e63a54C6df0131DBf5e10517abF3ce',
        ].map(troveManager => ({ troveManager, nonNativeCollateralToken: true, abis: { collateralToken: 'address:collTokenAddress', activePool: 'address:stableCollActivePool' } })),
        { troveManager: '0x366D48c04B0d315acF27Bd358558e92D4e2E9f3D', nonNativeCollateralToken: true, abis: { collateralToken: 'address:collTokenAddress' } },
        { troveManager: '0x7204e2f210865aA1854F33B3532ab2DEb386CB59', nonNativeCollateralToken: true, abis: { collateralToken: 'address:collTokenAddress' } },
      ],
    },
    ethereum: {
      troveManagers: [
        { troveManager: '0x7ee5175dFBD7c66Aa00043493334845376E43a8a', nonNativeCollateralToken: true, abis: { collateralToken: 'address:collToken' } },
        { troveManager: '0x675CD7d43d7665f851997B7F0f2B0265a213BAB8', nonNativeCollateralToken: true, abis: { collateralToken: 'address:collToken' } },
        { troveManager: '0x1e49892c0d0D4455bbbA633EeDaDd6d26224369e', nonNativeCollateralToken: true, abis: { collateralToken: 'address:collTokenAddress', activePool: 'address:stableCollActivePool' } },
      ],
    },
    arbitrum: {
      troveManager: '0x561d2d58bdad7a723a2cf71e8909a409dc2112ec',
      staking: ['0xc3fbc4056689cfab3f23809aa25004899ff4d75a', '0x9eF758aC000a354479e538B8b2f01b917b8e89e7'],
    },
    polygon: {
      troveManager: '0x68738A47d40C34d890168aB7B612A6f649f395e4',
      staking: ['0x3509f19581afedeff07c53592bc0ca84e4855475', '0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea'],
    },
    avax: {
      troveManager: '0x561d2d58bdad7a723a2cf71e8909a409dc2112ec',
      staking: ['0x68738a47d40c34d890168ab7b612a6f649f395e4', '0x9ef758ac000a354479e538b8b2f01b917b8e89e7'],
    },
  },
  // --- Liquity V2 (getLiquityV2Tvl, collateral registries) ---
  'liquity-v2': {
    _options: { helperType: 'v2' },
    hallmarks: [
      ['2025-02-12', 'Issue found in contracts'],
      ['2025-05-19', 'Liquity V2 relaunch'],
    ],
    ethereum: ['0xd99dE73b95236F69A559117ECD6F519Af780F3f7', '0xf949982b91c8c61e952b3ba942cbbfaef5386684'],
  },
  'asymmetry-usdaf': {
    _options: { helperType: 'v2' },
    ethereum: ['0xCFf0DcAb01563e5324ef9D0AdB0677d9C167d791', '0x33D68055Cd54061991B2e98b9ab326fFCE4d60Fe'],
  },
  'defi-dollar-cdp': {
    _options: { helperType: 'v2' },
    ethereum: '0x1ec9287465ef04a7486779e81370c15624c939e8',
  },
  'ebisu-ebUSD': {
    _options: { helperType: 'v2' },
    ethereum: '0x5e159fAC2D137F7B83A12B9F30ac6aB2ba6d45E7',
    plasma: '0x602096a2f43b43d11dcb3713702dda963c45adc6',
  },
  'enosys-loans': {
    _options: { helperType: 'v2' },
    flare: '0x9474206bc035D03d142264fd9913d1D51246d3AC',
  },
  'felix': {
    _options: { helperType: 'v2' },
    hyperliquid: '0x9De1e57049c475736289Cb006212F3E1DCe4711B',
  },
  'nerite': {
    _options: { helperType: 'v2' },
    arbitrum: '0x7f7fbc2711c0d6e8ef757dbb82038032dd168e68',
  },
  'orki-usd': {
    _options: { helperType: 'v2' },
    swellchain: '0xce9f80a0dcd51fb3dd4f0d6bec3afdcaea10c912',
  },
  'quill-fi': {
    _options: { helperType: 'v2' },
    scroll: ['0xcc4f29f9d1b03c8e77fc0057a120e2c370d6863d', '0x358d90036e70542ae24b3813c0efecc1f8811442'],
  },
  'magma': {
    iotex: {
      troveManagers: [
        { troveManager: '0x21d81DABF6985587CE64C2E8EB12F69DF2178fe2' },
        { troveManager: '0xAeB0B38040aDdc4a2b520919f13944D9bC944435' },
        { troveManager: '0x4315BcE6076953571caf1903d15D682727FBD935' },
        { troveManager: '0xFF5F4bA96586EDae7E7D838D8770dFB3376Ec245', collateralToken: ADDRESSES.bob.uniBTC }, // uniBTC
      ],
    },
  },
  'polyquity': {
    polygon: {
      troveManagers: [
        { troveManager: '0xA2A065DBCBAE680DF2E6bfB7E5E41F1f1710e63b' },
        { troveManager: '0x09273531f634391dE6be7e63C819F4ccC086F41c', collateralToken: ADDRESSES.polygon.USDC }, // USDC (polygon)
      ],
    },
  },
  'satoshi-finance': {
    bsc: {
      troveManager: '0x3cd34afeba07c02443BECBb2840506F4230f84cB',
      collateralToken: ADDRESSES.bsc.BTCB, // BTCB (bsc)
      staking: ['0x28c0e5160AB7B821A98745A3236aD2414F5dC041', '0x708bAac4B235d3F62bD18e58c0594b8B20b2ED5B'],
    },
  },
  'teddy': {
    methodology: 'Get tokens on stability pool and troves, TSD has been replaced by LUSD',
    avax: {
      troveManager: '0xd22b04395705144Fd12AfFD854248427A2776194',
      staking: ['0xb4387D93B5A9392f64963cd44389e7D9D2E1053c', '0x094bd7b2d99711a1486fb94d4395801c6d0fddcc'],
      pool2: ['0x9717Ff7406Be065EA177bA9ab1bE704060Af8370', '0x67E395B6ACd948931eeE8F52C7c1Fe537E7f1a7a'],
    },
  },
  'sable-finance': {
    bsc: {
      troveManager: '0xEC035081376ce975Ba9EAF28dFeC7c7A4c483B85',
      pool2: ['0xFbc81aEB7e5c11d4A60a0690Db9F36F93E25B16C', '0xa0D4e270D9EB4E41f7aB02337c21692D7eECCCB0'],
    },
  },
  'zkUSD': {
    start: '2023-11-14',
    linea: '0xE06F4754e94E2b6A462E616Ca3Ec78c6f4674A61',
    neon_evm: '0x24c36094aB3C4Ca62252d3bFA47599E668187669',
  },
}

module.exports = buildProtocolExports(configs, liquityExportFn)
