const { uniTvlExports } = require('../unknownTokens')
const { buildProtocolExports } = require('./utils')

// V2 wrapper: normalizes chain configs (string factory or { factory, ...extras }) for uniTvlExports
function uniV2ExportFn(chainConfigs, options = {}) {
  const factoryMap = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    factoryMap[chain] = typeof config === 'string' ? config : config.factory
  })
  return uniTvlExports(factoryMap, options)
}

const uniV2Configs = {
  '3xcalibur': {
    hallmarks: [
      ['2022-11-10', 'Emissions started'],
    ],
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218',
  },
  'aborean': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    abstract: '0xF6cDfFf7Ad51caaD860e7A35d6D4075d74039a6B',
  },
  'aerodrome': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    base: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
  },
  'andromeada': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    base: '0xB9e611CaD79f350929C8E36cAbbe5D2Ce9502D51',
  },
  'arena-dex': {
    misrepresentedTokens: true,
    avax: '0xF16784dcAf838a3e16bEF7711a62D12413c39BD1',
  },
  'areon-swap': {
    misrepresentedTokens: true,
    area: '0x4df039804873717bff7d03694fb941cf0469b79e',
  },
  'artexswap_xyz': {
    misrepresentedTokens: true,
    artela: '0xa65f38efbE4b0b602C9FEBE887448263547aaeeD',
  },
  'bahamut-dex': {
    misrepresentedTokens: true,
    ftn: '0x63D19A275fd468aA5A29FAc7B14697Ca0b5B3315',
  },
  'BallExchange': {
    misrepresentedTokens: true,
    shibarium: '0x6d17c4d4524de46e33a09deb37ad6e7e87780137',
  },
  'baoswap': {
    misrepresentedTokens: true,
    xdai: '0x45DE240fbE2077dd3e711299538A09854FAE9c9b',
  },
  'basefinance-v1': {
    misrepresentedTokens: true,
    base: '0x99fbA55CAd2e0CF3750E3f48F6b8a87e6CdBf8c0',
  },
  'BBQSwap': {
    misrepresentedTokens: true,
    ham: '0x7304e5751973113fA7c4FFf677871B926258f27e',
  },
  'beam-swap': {
    misrepresentedTokens: true,
    beam: '0x662b526FB70EBB508962f3f61c9F735f687C8fA5',
  },
  'bescswap': {
    misrepresentedTokens: true,
    besc: '0x20EE72D1B7E36e97566f31761dfF14eDc35Fbf22',
  },
  'BetterSwap': {
    misrepresentedTokens: true,
    vechain: '0x5970dcbebac33e75eff315c675f1d2654f7bf1f5',
  },
  'bevmswap-xyz': {
    misrepresentedTokens: true,
    bevm: '0xAdEFa8CFD0655e319559c482c1443Cc6fa804C1F',
  },
  'biokript': {
    misrepresentedTokens: true,
    bsc: '0x795802cb01a7be4be2f7f114b232a83b3adce64a',
  },
  'bitgenie-dex': {
    misrepresentedTokens: true,
    merlin: '0xEa51E2E458aE7Cb921d47fC463Ac4fED7ae65a41',
  },
  'bitswap-bb-v2': {
    misrepresentedTokens: true,
    bouncebit: '0x6d2Ae8505Ab39c9cF94abf69d75acc6115C2E3c0',
  },
  'blackhole': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    avax: '0xfE926062Fb99CA5653080d6C14fE945Ad68c265C',
  },
  'blasterswap-v2': {
    misrepresentedTokens: true,
    blast: '0x9CC1599D4378Ea41d444642D18AA9Be44f709ffD',
  },
  'bluelotusdao': {
    misrepresentedTokens: true,
    genesys: '0x5c4619104985163b3839dA465232B6D2a9588E7B',
  },
  'BombFinance': {
    misrepresentedTokens: true,
    fantom: '0xD9473A05b2edf4f614593bA5D1dBd3021d8e0Ebe',
  },
  'bonedex': {
    misrepresentedTokens: true,
    shibarium: '0x907599886DeBF90CCB1e9B446b31D52bDD25926D',
  },
  'boomswap': {
    misrepresentedTokens: true,
    bsc: '0xB438dee6a8875AFAbB8a82e86ef56C4DEEe5D1b5',
  },
  'brownfi': {
    misrepresentedTokens: true,
    berachain: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    base: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    arbitrum: '0xD05395a6b6542020FBD38D31fe1377130b35592E',
    hyperliquid: '0x3240853b71c89209ea8764CDDfA3b81766553E55',
    bsc: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    linea: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    monad: '0x68bc42F886ddf6a4b0B90a9496493dA1f8304536',
  },
  'bulbaswap-v2': {
    misrepresentedTokens: true,
    _options: {
      blacklistedTokens: ['0x2840F9d9f96321435Ab0f977E7FDBf32EA8b304f', '0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc'],
    },
    morph: '0x8D2A8b8F7d200d75Bf5F9E84e01F9272f90EFB8b',
  },
  'bullionFX': {
    misrepresentedTokens: true,
    ethereum: '0x5E7CfE3DB397d3DF3F516d79a072F4C2ae5f39bb',
  },
  'busta': {
    misrepresentedTokens: true,
    bsc: '0xCdAfc63DE847bBfb7E6B56B21aad12f8F6D877be',
  },
  'bwswap': {
    misrepresentedTokens: true,
    base: '0x67233C258BAeE28b2a7d42ec19fBD0b750a77Cd1',
  },
  'bxh': {
    misrepresentedTokens: true,
    heco: '0xe0367ec2bd4ba22b1593e4fefcb91d29de6c512a',
    bsc: '0x7897c32cbda1935e97c0b59f244747562d4d97c1',
    ethereum: '0x8d0fCA60fDf50CFE65e3E667A37Ff3010D6d1e8d',
    avax: '0xDeC9231b2492ccE6BA01376E2cbd2bd821150e8C',
    okexchain: '0xff65bc42c10dcc73ac0924b674fd3e30427c7823',
  },
  'candyswap': {
    misrepresentedTokens: true,
    meer: '0x2484E167b61c819a167D1219C187C3eE364A4F64',
  },
  'capx': {
    misrepresentedTokens: false,
    _options: {
      useDefaultCoreAssets: true,
    },
    capx: '0x5C5A750681708599A77057Fe599c1a7942dcc086',
  },
  'ciento': {
    misrepresentedTokens: true,
    planq: '0xd2d19c4AdEEB88b93527E3e8D1924F0Ba8325755',
  },
  'citadelswap': {
    misrepresentedTokens: true,
    base: '0xbe720274c24b5ec773559b8c7e28c2503dac7645',
  },
  'cl-dex': {
    misrepresentedTokens: true,
    klaytn: '0x93fa0E1deE99ac4158a617a6EC79cB941bD9a39F',
  },
  'cobraswap': {
    misrepresentedTokens: true,
    bsc: '0x3165d94dd2f71381495cb897832de02710a0dce5',
  },
  'comet-swap-v2': {
    misrepresentedTokens: true,
    astar: '0x2a5d54C0E8B24e73D2b94fb1c1B1A61459F42a0D',
  },
  'crowfi': {
    misrepresentedTokens: true,
    _options: {
      '0': 'c',
      '1': 'r',
      '2': 'o',
      '3': 'n',
      '4': 'o',
      '5': 's',
    },
    cronos: '0xDdcf30c1A85e5a60d85310d6b0D3952A75a00db4',
  },
  'daiko-dex': {
    hallmarks: [
      ['2024-06-07', 'Rug Pull'],
    ],
    misrepresentedTokens: true,
    taiko: '0x2cFAe8F731D6a04f3E868deB03ad73576695271A',
  },
  'dalmatiandex': {
    misrepresentedTokens: true,
    shibarium: '0x80108b858e04d5a35EF7dA7A67Cf45eeD18abf27',
  },
  'degendex-fi': {
    misrepresentedTokens: true,
    degen: '0x45c1f8AF23Ea55e51927EE9A4d456fa7BCc5F0Fe',
  },
  'degenswap': {
    misrepresentedTokens: true,
    degen: '0xA5E57CaB76caa09F66280F9Eb1529ed1059E87ba',
  },
  'diamondswap': {
    misrepresentedTokens: true,
    odyssey: '0x7d57C45dC107497C5c5c0F544a84691D2b06BC83',
    base: '0xdc93aca9bf72ceb35d1f2cd305bd8335b5b88757',
    avax: '0x7ab5ac142799b0a3b6f95c27a1f2149ebcf5287d',
  },
  'dinosaureggs': {
    misrepresentedTokens: true,
    bsc: '0x73d9f93d53505cb8c4c7f952ae42450d9e859d10',
  },
  'diviswap': {
    misrepresentedTokens: true,
    chz: '0xbdd9c322ecf401e09c9d2dca3be46a7e45d48bb1',
  },
  'dogswap': {
    misrepresentedTokens: true,
    shibarium: '0xA780FcBFF7c5232FDbEF4fc67313bEcFfdf64172',
  },
  'dojoswap-ancient8': {
    misrepresentedTokens: true,
    ancient8: '0x7d6eb409e2540d27Ea6Dc976E1a549a3dBcBfFBC',
  },
  'doveswap': {
    misrepresentedTokens: true,
    polygon_zkevm: '0xeA2709fCD78141976803C3aecA23eCEa3Cb9cb41',
  },
  'dracula-era': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    era: '0x68e03D7B8B3F9669750C1282AD6d36988f4FE18e',
  },
  'dragonswap': {
    misrepresentedTokens: true,
    klaytn: '0x224302153096E3ba16c4423d9Ba102D365a94B2B',
  },
  'dragonswap-sei': {
    misrepresentedTokens: true,
    sei: '0x71f6b49ae1558357bbb5a6074f1143c46cbca03d',
  },
  'dtx-dex': {
    misrepresentedTokens: true,
    taiko: '0x2EA9051d5a48eA2350b26306f2b959D262cf67e1',
  },
  'duckydefi': {
    misrepresentedTokens: true,
    cronos: '0x796E38Bb00f39a3D39ab75297D8d6202505f52e2',
  },
  'electroswap-v2': {
    misrepresentedTokens: true,
    etn: '0x203D550ed6fA9dAB8A4190720CF9F65138abd15B',
  },
  'ethervista': {
    misrepresentedTokens: true,
    ethereum: '0x9a27cb5ae0B2cEe0bb71f9A85C0D60f3920757B4',
  },
  'excalibur': {
    misrepresentedTokens: true,
    fantom: '0x08b3CCa975a82cFA6f912E0eeDdE53A629770D3f',
  },
  'fizzswap-v2': {
    misrepresentedTokens: true,
    silicon_zk: '0xCB72354080A1d3B8A48425B889025d0799c52095',
  },
  'flow-swap-v2': {
    misrepresentedTokens: true,
    flow: '0x681D1bFE03522e0727730Ba02a05CD3C0a08fa30',
  },
  'fluxusbase': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    base: '0x27c2d144b106B26Be3d0dEB6c14c5CFA2e9a507C',
  },
  'FomoSwap': {
    misrepresentedTokens: true,
    tara: '0x4a0Ff253BcE0CB539faC23517FFD968308220C5B',
  },
  'frogswap': {
    misrepresentedTokens: true,
    degen: '0xA994635243b55468B9C421559516BdE229E0930B',
  },
  'fuseon': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    plasma: '0x07A91205ee7d5a5d59B707B89Ef0c3434357e52B',
  },
  'gasturbo-io-dex': {
    misrepresentedTokens: true,
    arbitrum: '0x7e299DdF7E12663570dBfA8F3F20CB54f8fD04fA',
  },
  'gloom': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    sonic: '0x385AC659B50dF7f90755f974409D02dc21ea8bB0',
  },
  'gravity-finance': {
    misrepresentedTokens: true,
    polygon: '0x3ed75AfF4094d2Aaa38FaFCa64EF1C152ec1Cf20',
  },
  'greenhouse': {
    misrepresentedTokens: true,
    polygon: '0x75ED971834B0e176A053AC959D9Cf77F0B4c89D0',
  },
  'grxswap': {
    misrepresentedTokens: true,
    grx: '0xc7316818841f355c5107753a3f3fdea799bd25f6',
  },
  'gt3': {
    misrepresentedTokens: true,
    polygon: '0x2d7360Db7216792cfc2c73B79C0cA629007E2af4',
  },
  'h2-finance': {
    misrepresentedTokens: true,
    cronos_zkevm: '0x50704Ac00064be03CEEd817f41E0Aa61F52ef4DC',
  },
  'hercules-v2': {
    misrepresentedTokens: true,
    metis: '0xF38E7c7f8eA779e8A193B61f9155E6650CbAE095',
  },
  'hiveswap': {
    misrepresentedTokens: true,
    map: '0x29c3d087302e3fCb75F16175A09E4C39119459B2',
  },
  'hybra-v2': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    hyperliquid: '0x9c7397c9C5ecC400992843408D3A283fE9108009',
  },
  'hyperpie-v2-dex': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    hyperliquid: '0xeAF40318453a81993569B14b898AAC31Df6133fA',
  },
  'hyperswap-v2': {
    misrepresentedTokens: true,
    hyperliquid: '0x724412C00059bf7d6ee7d4a1d0D5cd4de3ea1C48',
  },
  'hypertrade-v2': {
    misrepresentedTokens: true,
    hyperliquid: '0x4b6ac7503d3fd79ce23d7ae463d14aaaf07f6573',
  },
  'iguana-v2': {
    misrepresentedTokens: true,
    etlk: '0x3eebf549D2d8839E387B63796327eE2C8f64A0C4',
  },
  'in_dex': {
    misrepresentedTokens: true,
    hsk: '0x09ee9eCc6E2B458508E05Da7f90E324AE54620D2',
  },
  'incaswap': {
    misrepresentedTokens: true,
    matchain: '0x1d9e11881Fca0e692B09AF0C0cbE70A643CB06FB',
  },
  'inkswap': {
    misrepresentedTokens: true,
    ink: '0xBD5B41358A6601924F1Fd708aF1535a671f530A9',
  },
  'inkyswap': {
    misrepresentedTokens: true,
    ink: '0x458C5d5B75ccBA22651D2C5b61cB1EA1e0b0f95D',
  },
  'inswap': {
    misrepresentedTokens: true,
    xlayer: '0xAa7b908653c1a2b713E64723F384B8AE7Ba5ab62',
  },
  'JaceSwap': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    xlayer: '0x40E9fC0A18ccfDc87C19A1bA5b7F84FC51879600',
  },
  'jellybeanswap': {
    misrepresentedTokens: true,
    bsc: '0x320827adb3f759a386348b325c54803b2b3a7572',
  },
  'jibswap': {
    misrepresentedTokens: true,
    jbc: '0x4BBdA880C5A0cDcEc6510f0450c6C8bC5773D499',
  },
  'joc': {
    misrepresentedTokens: false,
    _options: {
      useDefaultCoreAssets: true,
    },
    joc: '0x936e3Dc5F46a0fE1BdE6dB255e97B88fB675fEC2',
  },
  'jumpdefi': {
    misrepresentedTokens: true,
    telos: '0xff59EBFf3e3F72E8162eA2aB0a0d1C9258692dF5',
  },
  'kaspacom-dex': {
    misrepresentedTokens: true,
    kasplex: '0xa9CBa43A407c9Eb30933EA21f7b9D74A128D613c',
  },
  'kewl': {
    misrepresentedTokens: true,
    chz: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    avax: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    arbitrum: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    sonic: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    base: '0x5636A64B835F4E3821C798fdA16E0bA106357646',
    bsc: '0x5636A64B835F4E3821C798fdA16E0bA106357646',
  },
  'kittenswap': {
    misrepresentedTokens: true,
    hyperliquid: '0xDa12F450580A4cc485C3b501BAB7b0B3cbc3B31B',
  },
  'kittypunch': {
    misrepresentedTokens: true,
    flow: '0x29372c22459a4e373851798bFd6808e71EA34A71',
  },
  'kittypunch-kona-v2': {
    misrepresentedTokens: true,
    abstract: '0x7c2e370CA0fCb60D8202b8C5b01f758bcAD41860',
  },
  'kodiak-v2': {
    misrepresentedTokens: true,
    berachain: '0x5e705e184d233ff2a7cb1553793464a9d0c3028f',
  },
  'kodo-exchange': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    taiko: '0x535E02960574d8155596a73c7Ad66e87e37Eb6Bc',
  },
  'kswap': {
    misrepresentedTokens: true,
    kava: '0xEFD3ad14E5cF09b0EbE435756337fb2e9D10Dc1a',
  },
  'lfgswap-xlayer': {
    misrepresentedTokens: true,
    xlayer: '0x0F6DcC7a1B4665b93f1c639527336540B2076449',
  },
  'lotusdex-v2': {
    misrepresentedTokens: true,
    mantra: '0xf8f54C91E868c7CF87774C388B6793807921BAa1',
  },
  'lovelyswap-v2': {
    misrepresentedTokens: true,
    bsc: '0x7db16925214B2F5D65dB741D59208A1187B9961c',
    base: '0x7db16925214B2F5D65dB741D59208A1187B9961c',
    polygon: '0x177aeb3727c91c4796766336923c4da431c59637',
  },
  'madness-finance': {
    misrepresentedTokens: true,
    monad: '0x93d71152A93619c0b10A2EFc856AC46120FD01Ab',
  },
  'magicfox': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    polygon: '0xa2d23C7Ca6D360D5B0b30CaFF79dbBfa242B4811',
  },
  'ManaSwap': {
    misrepresentedTokens: true,
    hyperliquid: '0x46BC787Bf21D9178f2dEbAD939e76c7E9Dd0A392',
  },
  'mateswap-xyz': {
    misrepresentedTokens: true,
    lac: '0x12D9CC71b28B70d08f28CCf92d9Ab1D8400f97bD',
  },
  'melegaswap': {
    misrepresentedTokens: false,
    _options: {
      useDefaultCoreAssets: true,
      blacklistedTokens: ['0x1a515bf4e35AA2DF67109281DE6B3b00Ec37675E', '0x963556de0eb8138e97a85f0a86ee0acd159d210b'],
    },
    bsc: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
  },
  'memebox-fi': {
    misrepresentedTokens: true,
    sonic: '0x079463f811e6EB2E226908E79144CDDB59a7fB71',
  },
  'metavault-amm-v2': {
    misrepresentedTokens: true,
    scroll: '0xCc570Ec20eCB62cd9589FA33724514BDBc98DC7E',
    linea: '0xCc570Ec20eCB62cd9589FA33724514BDBc98DC7E',
  },
  'metropolis-exchange-amm': {
    misrepresentedTokens: true,
    sonic: '0x1570300e9cFEC66c9Fb0C8bc14366C86EB170Ad0',
  },
  'mezo-tigris': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    mezo: '0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248',
  },
  'minerswap': {
    misrepresentedTokens: true,
    ethpow: '0x91836d77af0a5fda36c5a1f3c11dbc7766de4d03',
  },
  'moai-fi-v2': {
    misrepresentedTokens: true,
    xrplevm: '0x645541A2e2fb655fd7765898DFfbc7dd051E5B67',
  },
  'mobiusdex-xyz': {
    misrepresentedTokens: true,
    sonic: '0x475f2dDfA1A5da19F4a3F282F1305f285E742C45',
  },
  'modemax-dex': {
    misrepresentedTokens: true,
    mode: '0x423A079C43e4eD7ca561Ef04765eDB796F0Ec6c6',
  },
  'monoswap-v2': {
    misrepresentedTokens: true,
    blast: '0xE27cb06A15230A7480d02956a3521E78C5bFD2D0',
  },
  'mswap': {
    misrepresentedTokens: true,
    matchain: '0x338bCC4efd3cA000D123d7352b362Fc6D5B3D829',
  },
  'mtt-dex': {
    misrepresentedTokens: true,
    mtt_network: '0x6e9400a1501D934771cD9aeD16A3f33A0CE3F9f5',
  },
  'multex': {
    misrepresentedTokens: true,
    shape: '0x74Eac16615ed3b5A8Df2d00d72C72780beDED02A',
  },
  'mustcometh': {
    misrepresentedTokens: true,
    polygon: '0x800b052609c355cA8103E06F022aA30647eAd60a',
  },
  'noxa-fi': {
    misrepresentedTokens: true,
    abstract: '0xE1e98623082f662BCA1009a05382758f86F133b3',
  },
  'ocelex-v1': {
    misrepresentedTokens: false,
    _options: {
      hasStablePools: true,
      useDefaultCoreAssets: true,
    },
    zircuit: '0xdd018347c29a27088eb2d0bf0637d9a05b30666c',
  },
  'octoswap-classic': {
    misrepresentedTokens: true,
    monad: '0xCe104732685B9D7b2F07A09d828F6b19786cdA32',
  },
  'okutrade-goat': {
    misrepresentedTokens: true,
    goat: '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
  },
  'omaxswap': {
    misrepresentedTokens: true,
    omax: '0xEbB321f840c1F1d63a62b01F464D6921bfC3dD08',
  },
  'Omnidrome': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    zeta: '0x769d1BcB5FDf30F5a9D19f1ab8A3cF8b60a6e855',
  },
  'onionswap': {
    misrepresentedTokens: true,
    base: '0xE196d4903999b00a90Cc8d0fc017e01017fd58D6',
  },
  'openswap': {
    misrepresentedTokens: true,
    rss3_vsl: '0x2F6d9dac92e197bE02aC2DE8BBD7E02837E2dB8d',
  },
  'pacificswap': {
    misrepresentedTokens: true,
    manta: '0x19405689008954ccddbc8c7ef2b64dd88b4a674a',
  },
  'pandaswap': {
    misrepresentedTokens: true,
    bsc: '0x9ad32bf5dafe152cbe027398219611db4e8753b3',
  },
  'pandora-digital': {
    misrepresentedTokens: true,
    bsc: '0xFf9A4E72405Df3ca3D909523229677e6B2b8dC71',
  },
  'pantherswap': {
    misrepresentedTokens: true,
    bsc: '0x670f55c6284c629c23baE99F585e3f17E8b9FC31',
  },
  'papyrusswap': {
    misrepresentedTokens: true,
    scroll: '0xD5f3D3fb72210bfe71a59c05e0b8D72973baa2a6',
  },
  'paraluni-dex': {
    hallmarks: [
      ['2022-05-02', 'launch new dex'],
    ],
    misrepresentedTokens: true,
    bsc: '0xf3b426a160686082447545e1150829ee5485a91a',
  },
  'perfectswap': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    arbitrum: '0xC7ee0B06c2d9c97589bEa593c6E9F6965451Fe93',
  },
  'piperx-v2': {
    misrepresentedTokens: true,
    sty: '0x6D3e2f58954bf4E1d0C4bA26a85a1b49b2e244C6',
  },
  'plunderswap': {
    misrepresentedTokens: true,
    zilliqa: '0xf42d1058f233329185A36B04B7f96105afa1adD2',
  },
  'polydex': {
    misrepresentedTokens: true,
    polygon: '0xEAA98F7b5f7BfbcD1aF14D0efAa9d9e68D82f640',
  },
  'pond': {
    misrepresentedTokens: true,
    fuse: '0x1d1f1A7280D67246665Bb196F38553b469294f3a',
  },
  'ponyswap': {
    misrepresentedTokens: true,
    arbitrum: '0x66020547Ce3c861dec7632495D86e1b93dA6542c',
  },
  'PoorExchange': {
    misrepresentedTokens: true,
    arbitrum: '0x9fA0988D9e4b6362e0aaA02D1A09196a78c177e1',
  },
  'potatoswap': {
    misrepresentedTokens: true,
    xlayer: '0x630db8e822805c82ca40a54dae02dd5ac31f7fcf',
  },
  'printy': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    avax: '0xc62Ca231Cd2b0c530C622269dA02374134511a36',
  },
  'protofi': {
    misrepresentedTokens: true,
    fantom: '0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76',
  },
  'PulseGun': {
    misrepresentedTokens: true,
    pulse: '0x5c92d17f52987DED8D2c0Fa0d5fbfcD68A09B074',
  },
  'pumex': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    injective: '0x105A0A9c1D9e29e0D68B746538895c94468108d2',
  },
  'purps': {
    misrepresentedTokens: true,
    monad: '0xAfE4d3eB898591ACe6285176b26f0F5BEb894447',
  },
  'quillswap': {
    hallmarks: [
      ['2023-10-24', 'Liquidity Removed'],
    ],
    misrepresentedTokens: true,
    scroll: '0xab8aEfe85faD683A6bDE16EeD04C3420C713324b',
  },
  'raccoonswap': {
    misrepresentedTokens: true,
    parex: '0x933A81E5d5aF4A182C1CE7FD0F96599Dd469e66A',
  },
  'reservoir-tools-v2': {
    misrepresentedTokens: true,
    abstract: '0x566d7510dEE58360a64C9827257cF6D0Dc43985E',
    zero_network: '0x1B4427e212475B12e62f0f142b8AfEf3BC18B559',
    shape: '0xb411eaf2f2070822b26e372e3ea63c5060ba45e6',
    ink: '0xfe57a6ba1951f69ae2ed4abe23e0f095df500c04',
  },
  'rexdex': {
    misrepresentedTokens: true,
    wan: '0xCc2F30462ED1C47Dd7Fb75C81c7F4Cd721eB2A66',
  },
  'rubicon': {
    misrepresentedTokens: true,
    base: '0xA5cA8Ba2e3017E9aF3Bd9EDa69e9E8C263Abf6cD',
  },
  'sanctuary': {
    misrepresentedTokens: true,
    scroll: '0xAD71e466d6E9c5CbAC804dBF60dE2543d58B4b5B',
  },
  'saucerswap': {
    misrepresentedTokens: true,
    hedera: '0x0000000000000000000000000000000000103780',
  },
  'savmdex': {
    misrepresentedTokens: true,
    bevm: '0xc008f29AaddA007b123919a5a0561c1B2E37864A',
  },
  'savmswap': {
    misrepresentedTokens: true,
    svm: '0x1842c9bD09bCba88b58776c7995A9A9bD220A925',
  },
  'sboomfi': {
    misrepresentedTokens: true,
    sonic: '0x3638Ca700D67D560Be2A2d0DD471640957564829',
  },
  'scrollswap': {
    misrepresentedTokens: true,
    scroll: '0x0082123Cf29a85f48Cd977D3000aec145A3B452F',
  },
  'scrollswapfinance': {
    misrepresentedTokens: true,
    scroll: '0xaA4b3b63B0A828dc28b2De7Be6115198B080De09',
  },
  'seedfi-amm': {
    misrepresentedTokens: true,
    sseed: '0x76454AC9dF69875443D492128D059cE6e1A9091F',
  },
  'settlex-v2': {
    misrepresentedTokens: true,
    stable: '0x19E10fb5875C4901D9650aFc001197285dBBC060',
  },
  'sharkswap': {
    misrepresentedTokens: true,
    sx: '0x6A482aC7f61Ed75B4Eb7C26cE8cD8a66bd07B88D',
    sxr: '0x610CfC3CBb3254fE69933a3Ab19aE1bF2aaaD7C8',
  },
  'shekelswap': {
    misrepresentedTokens: true,
    arbitrum: '0xd78BA83aD495695940E97889E7191F717AfaC8E0',
  },
  'Shibafantom': {
    misrepresentedTokens: true,
    fantom: '0xeAcC845E4db0aB59A326513347a37ed4E999aBD8',
  },
  'shibanova': {
    misrepresentedTokens: true,
    bsc: '0x251912dE998ec91DFDf67EfBe032d6f4aB5EC485',
  },
  'shibbex': {
    misrepresentedTokens: true,
    shibarium: '0x6369e8dFaD8DB8378179D74C187f1D5DEa47Fa9F',
  },
  'shimmersea': {
    misrepresentedTokens: true,
    shimmer_evm: '0x4fb5d3a06f5de2e88ce490e2e11d22b840d5ac47',
    iotaevm: '0x349aaAc3a500014981CBA11b64C76c66a6c1e8D0',
  },
  'sideswap-fi': {
    misrepresentedTokens: true,
    zkfair: '0x3F5a6e62cccD2C9AAF3dE431e127D65BC457000a',
  },
  'silkswap': {
    misrepresentedTokens: true,
    ftn: '0xd0c5d23290d63e06a0c4b87f14bd2f7aa551a895',
  },
  'skullswap': {
    misrepresentedTokens: true,
    fantom: '0x67BDF64a26A6B08f003580873448346c1C8bA93c',
  },
  'snap-v2': {
    misrepresentedTokens: true,
    tac: '0x2e9eB1Dd1F0462336a71dF52A6E387D207b6190f',
  },
  'solidex-finance-v2': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
      permitFailure: true,
    },
    cronos: '0xc6bd451EE56E8e42b8dde3921aD851645C416126',
  },
  'solidly': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    fantom: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
  },
  'someswap': {
    misrepresentedTokens: true,
    monad: '0x00008A3c1077325Bb19cd93e5a0f1E95144700fa',
  },
  'somnex-xyz': {
    misrepresentedTokens: true,
    somnia: '0xaFd71143Fb155058e96527B07695D93223747ed1',
  },
  'somnia-exchange': {
    misrepresentedTokens: true,
    somnia: '0x6C4853C97b981Aa848C2b56F160a73a46b5DCCD4',
  },
  'sonefi-xyz': {
    misrepresentedTokens: true,
    soneium: '0x82d2d0aAE77967d42ACf4F30B53e2de0055338De',
  },
  'sonic-market-amm': {
    misrepresentedTokens: true,
    sonic: '0x01D6747dD2d65dDD90FAEC2C84727c2706ee28E2',
  },
  'sonicxswap': {
    misrepresentedTokens: true,
    sonic: '0x0569F2A6B281b139bC164851cf86E4a792ca6e81',
  },
  'spartacus-exchange': {
    misrepresentedTokens: true,
    fantom: '0x535646cf57E4155Df723bb24625f356d98ae9D2F',
  },
  'squidswap': {
    misrepresentedTokens: true,
    ink: '0x63b54dBBD2DAbf89D5c536746e534711f6094199',
  },
  'stableswap': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    stable: '0x781a84FC7FA81267A15c9B06fbB80A043852B6D3',
  },
  'stableswap-dex': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    stable: '0xc5ba86e4A6F674816fA7c3B7cA438D63ec136bE9',
  },
  'step-exchange': {
    misrepresentedTokens: true,
    step: '0xf62b74E4a7aE8D27Cd983A54a9d24A89345413a5',
  },
  'straxswap': {
    misrepresentedTokens: true,
    stratis: '0xDC29A634611914ed73261A71C8F20D828cA2c09F',
  },
  'sunflowerswap': {
    misrepresentedTokens: true,
    moonbeam: '0xf6c49609e8d637c3d07133e28d369283b5e80c70',
  },
  'supernova': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    ethereum: '0x5aef44edfc5a7edd30826c724ea12d7be15bdc30',
  },
  'supswap-v2': {
    misrepresentedTokens: true,
    mode: '0x557f46F67a36E16Ff27e0a39C5DA6bFCB4Ff89c0',
  },
  'swanswap': {
    misrepresentedTokens: true,
    shape: '0x2Be0c88CCc1d42920beAe4633CDdBbACe5e8812c',
  },
  'swapos': {
    misrepresentedTokens: true,
    ethereum: '0xfB1Eb9a45Feb7269f3277233AF513482Bc04Ea63',
  },
  'swapx': {
    misrepresentedTokens: true,
    xone: '0x76bDc5a6190Ea31A6D5C7e93a8a2ff4dD15080A6',
  },
  'SwapX-v2': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    sonic: '0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663',
  },
  'taffy': {
    misrepresentedTokens: true,
    saakuru: '0xb9FFd4f89A86a989069CAcaE90e9ce824D0c4971',
  },
  'tarina': {
    misrepresentedTokens: true,
    avax: '0xb334a709dd2146caced08e698c05d4d22e2ac046',
  },
  'tenx-exchange': {
    misrepresentedTokens: true,
    tenet: '0xbaB158ED71F7FD4AD43b1db1aAc5d0EFA0a8469f',
  },
  'Torr-Finance': {
    misrepresentedTokens: true,
    bittorrent: '0xea34610f4373c8d75ed1810A6096197F297F2786',
  },
  'tropicalswap': {
    misrepresentedTokens: true,
    mantle: '0x5B54d3610ec3f7FB1d5B42Ccf4DF0fB4e136f249',
  },
  'turtleswap': {
    methodology: 'TVL counts liquidity across TurtleSwap pools via factory reserves.',
    misrepresentedTokens: true,
    start: 1719964800,
    vechain: '0x7751a8Df07F7Ae6f9E92B06a363b3c020F2830aC',
  },
  'ucs-finance': {
    misrepresentedTokens: true,
    unichain: '0x1ee365b3230Cd52c17A7a40633A0C53b2f11411B',
  },
  'ultrasolid-v2': {
    misrepresentedTokens: true,
    hyperliquid: '0x2658665492d0394E86d50d55050453127A28C09b',
  },
  'upheaval-v2': {
    misrepresentedTokens: true,
    hyperliquid: '0x98e19A533FadB2C9853983772E4e7aa09a1478e0',
  },
  'vanillaswap-v2': {
    misrepresentedTokens: true,
    defichain_evm: '0x79Ea1b897deeF37e3e42cDB66ca35DaA799E93a3',
  },
  'velodrome': {
    hallmarks: [
      ['2022-07-14', 'First OP grant awarded'],
      ['2022-08-04', 'Loss $350k Operational Funds'],
    ],
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    optimism: '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746',
  },
  'velodrome-v2': {
    hallmarks: [
      ['2023-06-22', 'v2 Migration on OP Mainnet'],
    ],
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
      permitFailure: true,
    },
    chain: '0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a',
  },
  'venuSwap': {
    misrepresentedTokens: true,
    zkfair: '0x4C72BF37eb72df730c22Df16ca594f6985130dD6',
  },
  'veRocket': {
    misrepresentedTokens: true,
    vechain: '0xbdc2EDaeA65B51053FFcE8Bc0721753c7895e12f',
  },
  'vexchange': {
    misrepresentedTokens: true,
    vechain: '0xB312582C023Cc4938CF0faEA2fd609b46D7509A2',
  },
  'VoltageSwap': {
    misrepresentedTokens: true,
    scroll: '0x7328d0dcbCcDA2F5bBA6Ce866cC9478cc8c0F938',
  },
  'vulcandex': {
    misrepresentedTokens: true,
    polygon: '0x293f45b6F9751316672da58AE87447d712AF85D7',
  },
  'vultureswap': {
    misrepresentedTokens: true,
    cronos: '0x45523BD2aB7E563E3a0F286be1F766e77546d579',
  },
  'weero-v2': {
    misrepresentedTokens: true,
    _options: {
      fromBlock: 184616686,
    },
    klaytn: '0xdE9634D8A1b5855E3Ddb0B0712b28031e18865d9',
  },
  'wemix-fi': {
    misrepresentedTokens: true,
    wemix: '0xe1F36C7B919c9f893E2Cd30b471434Aa2494664A',
  },
  'woof': {
    misrepresentedTokens: true,
    shibarium: '0x42D6041342021Bc317796C6A0F10Ce39346E9167',
  },
  'woofswap': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    shibarium: '0xB9fbdFA27B7ba8BB2d4bB4aB399e4c55F0F7F83a',
  },
  'woofswapGL': {
    misrepresentedTokens: true,
    _options: {
      hasStablePools: true,
    },
    gatelayer: '0xc850D2Ae73Cb81E2B74341534094BCcb4a366c24',
  },
  'xbased': {
    misrepresentedTokens: true,
    base: '0x7a9ACeB13bc00eEC11460A5D7122793461Da96E0',
  },
  'xenwave': {
    misrepresentedTokens: true,
    btn: '0xCba3Dc15Cfbcd900cF8133E39257c26727E86e3a',
  },
  'xrise33': {
    misrepresentedTokens: true,
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    xrplevm: '0xa9833699fBB0E3759a3C381DeB43A61Df99e8544',
  },
  'yakafinance': {
    misrepresentedTokens: true,
    sei: '0xd45dAff288075952822d5323F1d571e73435E929',
  },
  'yoshi-exchange': {
    misrepresentedTokens: true,
    fantom: '0xc5bc174cb6382fbab17771d05e6a918441deceea',
    bsc: '0x542b6524abf0bd47dc191504e38400ec14d0290c',
    ethereum: '0x773cadc167deafa46f603d96172fa45686c4fa58',
  },
  'youswap': {
    misrepresentedTokens: true,
    heco: '0x9f1cd0e59e78f5288e2fcf43030c9010d4f2991d',
    bsc: '0x137f34df5bcdb30f5e858fc77cb7ab60f8f7a09a',
    ethereum: '0xa7028337d3da1f04d638cc3b4dd09411486b49ea',
  },
  'zedaswap': {
    misrepresentedTokens: true,
    zeta: '0x61db4eecb460b88aa7dcbc9384152bfa2d24f306',
  },
  'zeniq-swap': {
    misrepresentedTokens: true,
    zeniq: '0x7D0cbcE25EaaB8D5434a53fB3B42077034a9bB99',
  },
  'Zenonswap': {
    misrepresentedTokens: true,
    degen: '0x97B162AD1443737B0500A5E726344D608eB9e255',
  },
  'zkfairswap': {
    misrepresentedTokens: true,
    zkfair: '0xeA70460a5B0E3A94EC05b1AaFCe9e6Eb11C334A0',
  },
  'zoodex': {
    misrepresentedTokens: true,
    fantom: '0x6178C3B21F7cA1adD84c16AD35452c85a85F5df4',
  },
  'zprotocol-dex': {
    misrepresentedTokens: true,
    scroll: '0xED93e976d43AF67Cc05aa9f6Ab3D2234358F0C81',
  },
}

module.exports = buildProtocolExports(uniV2Configs, uniV2ExportFn)
