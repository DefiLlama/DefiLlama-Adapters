const { getUniTVL } = require('../projects/helper/unknownTokens')
const { buildProtocolExports } = require('./utils')

const _chainExtraKeys = new Set(['factory', 'tvl', 'staking', 'pool2', 'borrowed', 'vesting', 'hallmarks'])

// V2 wrapper: normalizes chain configs (string factory or { factory, ...extras }) for getUniTVL
function uniV2ExportFn(chainConfigs, options = {}) {
  const result = {
  }
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      result[chain] = { tvl: getUniTVL({ factory: config, useDefaultCoreAssets: true, ...options }) }
    } else {
      const chainOpts = {}
      for (const [k, v] of Object.entries(config)) {
        if (!_chainExtraKeys.has(k)) chainOpts[k] = v
      }
      result[chain] = { tvl: getUniTVL({ factory: config.factory, useDefaultCoreAssets: true, ...options, ...chainOpts }) }
    }
  })
  return result
}

const uniV2Configs = {
  '1pulse': {
    pulse: '0x17C335D22456c798D5A3D021583eDAcbD4Ef6444',
  },
  '3xcalibur': {
    hallmarks: [
      ['2022-11-10', 'Emissions started'],
    ],
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218',
  },
  '9mm-v2': {
    base: '0x4c1b8D4ae77A37b94e195CAB316391d3C687ebd1',
    pulse: '0x3a0Fa7884dD93f3cd234bBE2A0958Ef04b05E13b',
    sonic: '0x0f7B3FcBa276A65dd6E41E400055dcb75BA66750',
  },
  'aborean': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    abstract: '0xF6cDfFf7Ad51caaD860e7A35d6D4075d74039a6B',
  },
  'aceofbase': {
    base: '0x46C6706E81CAD3173773c1ffb5D84C9eb652d570',
  },
  'adenafinance': {
    harmony: '0x44485473431fAF6EFA11D346d1057182d2A0A290',
  },
  'aerodrome': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    base: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
  },
  'agsfinance': {
    astar: '0x6A6a541FFb214ca228A58c27bD61b5A099Dc82CC',
  },
  'agus': {
    bsc: '0x1aEa6414e7F7A9581Ce53385b2902c59b34D4a94',
    core: '0x1aEa6414e7F7A9581Ce53385b2902c59b34D4a94',
  },
  'Akitaswap': {
    blast: '0x27C429dfF0e6d3B43B2C404C35f58C2b36cef916',
  },
  'akronswap': {
    ethereum: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4',
    arbitrum: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4',
    base: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4',
    bsc: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4',
  },
  'alienbase-area51': {
    base: '0x2d5dd5fa7B8a1BFBDbB0916B42280208Ee6DE51e',
  },
  'allinxswap': {
    bsc: '0xB755953681f0b54f59336294f6758aE9e2E3aB5e',
    op_bnb: '0xAFcA85A70Bd1C2Bf98DB7F24b2380134F76Af7f1',
  },
  'alphadex': {
    kava: '0x7e666D934F7525dF840d0CfFEaa3d6Bf3b3253a3',
    moonriver: '0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d',
  },
  'amaterasu': {
    aurora: '0x34696b6cE48051048f07f4cAfa39e3381242c3eD',
  },
  'ancora': {
    linea: '0xE7aC188E018f954A83c157ac686De7F66e819a51',
  },
  'andromeada': {
    _options: {
      hasStablePools: true,
    },
    base: '0xB9e611CaD79f350929C8E36cAbbe5D2Ce9502D51',
  },
  'aquas-trade': {
    europa: '0xc318a82CB7c2B0faf7e355BB8F285016956aBF55',
  },
  'arbiswap': {
    arbitrum: '0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f',
  },
  'arbswap': {
    arbitrum: '0xd394e9cc20f43d2651293756f8d320668e850f1b',
    arbitrum_nova: '0xf6239423FcF1c19ED2791D9648A90836074242Fd',
  },
  'archerswap': {
    core: '0xe0b8838e8d73ff1CA193E8cc2bC0Ebf7Cf86F620',
  },
  'arena-dex': {
    avax: '0xF16784dcAf838a3e16bEF7711a62D12413c39BD1',
  },
  'areon-swap': {
    area: '0x4df039804873717bff7d03694fb941cf0469b79e',
  },
  'artexswap_xyz': {
    artela: '0xa65f38efbE4b0b602C9FEBE887448263547aaeeD',
  },
  'astarexchange': {
    astar: '0x95f506E72777efCB3C54878bB4160b00Cd11cd84',
  },
  'asteroneo': {
    neox: '0x1dAbb81D9Faeb1DF4a8c97A60C5269c7D45e66B0',
  },
  'astroswap': {
    _options: {
      blacklistedTokens: ['0xcd7509b76281223f5b7d3ad5d47f8d7aa5c2b9bf', '0xd12f7a98c0d740e7ec82e8caf94eb79c56d1b623',],
    },
    velas: '0xe82d721A6CdeC2f86e9Fca074Ff671c8621F8459',
  },
  'auragi-finance': {
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0xa36b55DBe8e83Eb69C686368cF93ABC8A238CC5f',
  },
  'autotronic': {
    start: '2023-08-24',
    base: '0x55b3409335B81E7A8B7C085Bbb4047DDc23f7257',
  },
  'baguette': {
    avax: '0x3587B8c0136c2C3605a9E5B03ab54Da3e4044b50',
  },
  'bahamut-dex': {
    ftn: '0x63D19A275fd468aA5A29FAc7B14697Ca0b5B3315',
  },
  'BallExchange': {
    shibarium: '0x6d17c4d4524de46e33a09deb37ad6e7e87780137',
  },
  'balloonswap': {
    op_bnb: '0xCF8B8Ca7B70880c90C635672eB3D4882a52B4890',
  },
  'baoswap': {
    xdai: '0x45DE240fbE2077dd3e711299538A09854FAE9c9b',
  },
  'basefinance-v1': {
    base: '0x99fbA55CAd2e0CF3750E3f48F6b8a87e6CdBf8c0',
  },
  'baseswap': {
    _options: {
      permitFailure: true,
    },
    base: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB',
  },
  'baso': {
    _options: {
      hasStablePools: true,
    },
    base: '0xcEFbebF0b85B1638C19b01cE2A02C262F421B07d',
  },
  'BBQSwap': {
    ham: '0x7304e5751973113fA7c4FFf677871B926258f27e',
  },
  'beam-swap': {
    beam: '0x662b526FB70EBB508962f3f61c9F735f687C8fA5',
  },
  'beracaine': {
    berachain: '0x0Ec621393958dD9865B912CBdFf808d175B1B9f4',
  },
  'bescswap': {
    besc: '0x20EE72D1B7E36e97566f31761dfF14eDc35Fbf22',
  },
  'BetterSwap': {
    vechain: '0x5970dcbebac33e75eff315c675f1d2654f7bf1f5',
  },
  'bevmswap-xyz': {
    bevm: '0xAdEFa8CFD0655e319559c482c1443Cc6fa804C1F',
  },
  'binaryswap': {
    op_bnb: '0xd50aaE6C73E2486B0Da718D23F35Dcf5aad25911',
  },
  'biokript': {
    bsc: '0x795802cb01a7be4be2f7f114b232a83b3adce64a',
  },
  'bitgenie-dex': {
    merlin: '0xEa51E2E458aE7Cb921d47fC463Ac4fED7ae65a41',
  },
  'bitgert-swap': {
    bitgert: '0x456405E3d355ad27010Fd87e3c7cC8a2DcA372fD',
  },
  'bitswap-bb-v2': {
    bouncebit: '0x6d2Ae8505Ab39c9cF94abf69d75acc6115C2E3c0',
  },
  'blackhole': {
    _options: {
      hasStablePools: true,
    },
    avax: '0xfE926062Fb99CA5653080d6C14fE945Ad68c265C',
  },
  'blaspace': {
    blast: '0xCAb98fEd113d403EbD9E294D80Bf92E3f19ddD57',
  },
  'blastdex': {
    blast: '0x66346aac17d0e61156AC5F2A934ccF2a9BDe4c65',
  },
  'blasterswap-v2': {
    blast: '0x9CC1599D4378Ea41d444642D18AA9Be44f709ffD',
  },
  'blazeswap': {
    flare: '0x440602f459D7Dd500a74528003e6A20A46d6e2A6',
    songbird: '0x875b815a1D1b12a6fee3c068a7c43F80e4a50234',
  },
  'Blinkswap': {
    blast: '0xFfbDb302f29B29ee45D650DF44889450d252d868',
  },
  'bluelotusdao': {
    genesys: '0x5c4619104985163b3839dA465232B6D2a9588E7B',
  },
  'bluemeteor': {
    pulse: '0x2c68d8942fD4B5eC45a671fA230fb3dEBF224176',
  },
  'BombFinance': {
    fantom: '0xD9473A05b2edf4f614593bA5D1dBd3021d8e0Ebe',
  },
  'bonedex': {
    shibarium: '0x907599886DeBF90CCB1e9B446b31D52bDD25926D',
  },
  'boomswap': {
    bsc: '0xB438dee6a8875AFAbB8a82e86ef56C4DEEe5D1b5',
  },
  'boss-swap': {
    harmony: '0x7f107365E6Ef1F8824C724EA6aF7654AFB742963',
  },
  'bourbon': {
    dogechain: '0x6B09Aa7a03d918b08C8924591fc792ce9d80CBb5',
  },
  'brewswap': {
    bsc: '0xFe2bF5fc2D131dB07C5Ef7076856FD7f342738fF',
    polygon: '0x563c86d9F17914FF868BCbe3903B3ef829A82F9E',
  },
  'brise-swap': {
    bitgert: '0x1379a7f0bfc346d48508B4b162c37a4c43dd89dc',
  },
  'BroSwap': {
    core: '0x8edF7B8411b2e5dB740dbbf949E011e59fc7980a',
  },
  'brownfi': {
    berachain: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    base: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    arbitrum: '0xD05395a6b6542020FBD38D31fe1377130b35592E',
    hyperliquid: '0x3240853b71c89209ea8764CDDfA3b81766553E55',
    bsc: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    linea: '0x43AB776770cC5c739adDf318Af712DD40918C42d',
    monad: '0x68bc42F886ddf6a4b0B90a9496493dA1f8304536',
  },
  'bswap': {
    chainx: '0x356FD03E73ce821d5F7dFea51d1cB336EeFd67b1',
  },
  'bulbaswap-v2': {
    _options: {
      blacklistedTokens: ['0x2840F9d9f96321435Ab0f977E7FDBf32EA8b304f', '0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc'],
    },
    morph: '0x8D2A8b8F7d200d75Bf5F9E84e01F9272f90EFB8b',
  },
  'bullionFX': {
    ethereum: '0x5E7CfE3DB397d3DF3F516d79a072F4C2ae5f39bb',
  },
  'busta': {
    bsc: '0xCdAfc63DE847bBfb7E6B56B21aad12f8F6D877be',
  },
  'bwswap': {
    base: '0x67233C258BAeE28b2a7d42ec19fBD0b750a77Cd1',
  },
  'bxh': {
    heco: '0xe0367ec2bd4ba22b1593e4fefcb91d29de6c512a',
    bsc: '0x7897c32cbda1935e97c0b59f244747562d4d97c1',
    ethereum: '0x8d0fCA60fDf50CFE65e3E667A37Ff3010D6d1e8d',
    avax: '0xDeC9231b2492ccE6BA01376E2cbd2bd821150e8C',
    okexchain: '0xff65bc42c10dcc73ac0924b674fd3e30427c7823',
  },
  'cakewwap': {
    ethpow: '0xe97352E2d3a4F418044a91533a2379dbd11b425d',
  },
  'camelot': {
    start: '2022-11-22',
    apechain: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    arbitrum: '0x6EcCab422D763aC031210895C81787E87B43A652',
    duckchain: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    gravity: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    occ: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    rari: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    reya: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    sanko: '0x18E621B64d7808c3C47bccbbD7485d23F257D26f',
    spn: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4',
    xai: '0x18E621B64d7808c3C47bccbbD7485d23F257D26f',
  },
  'candyswap': {
    meer: '0x2484E167b61c819a167D1219C187C3eE364A4F64',
  },
  'canto-dex': {
    _options: {
      hasStablePools: true,
    },
    canto: '0xE387067f12561e579C5f7d4294f51867E0c1cFba',
  },
  'canto-forte': {
    canto: '0x759e390D946249c63e0A1d8a810C5A577a591719',
  },
  'cantoswap': {
    canto: '0x6eE19E5e5F1018c26bDa107cB2CCd9dA461A698c',
  },
  'capitaldex': {
    ethereum: '0x03407772F5EBFB9B10Df007A2DD6FFf4EdE47B53',
    curio: '0x03407772F5EBFB9B10Df007A2DD6FFf4EdE47B53',
  },
  'capricorn': {
    cube: '0x33CB4150f3ADFCD92fbFA3309823A2a242bF280f',
  },
  'capx': {
    capx: '0x5C5A750681708599A77057Fe599c1a7942dcc086',
  },
  'carbonswap': {
    energyweb: '0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd',
  },
  'carrotswap': {
    neox: '0x753df473702cB31BB81a93966e658e1AA4f10DD8',
  },
  'ceto-swap': {
    manta: '0xf50c8e257ccf3e2b58651f78e3c2dc83446d9c47',
  },
  'ChewySwap': {
    dogechain: '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A',
    shibarium: '0xEDedDbde5ffA62545eDF97054edC11013ED72125',
  },
  'chickendefi': {
    sonic: '0x796F21EFA35bf3b0360aC8e3c108241f88E47A3a',
  },
  'chiliswap': {
    scroll: '0x2627161e60fFa589f8bD3798F0947d572A7EdF68',
  },
  'chilizswap': {
    chz: '0xcF4A2be8Fe92fEe8e350AD8D876274749Ae0CBb1',
  },
  'chimeradex': {
    scroll: '0x661B92cc18a8d73209dBa1394aE56fca2F9DDb4D',
    arbitrum: '0x661B92cc18a8d73209dBa1394aE56fca2F9DDb4D',
  },
  'Chocoinu': {
    avax: '0x49a5044268A54467a94905d1458A88413695afc1',
  },
  'chronos': {
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0xCe9240869391928253Ed9cc9Bcb8cb98CB5B0722',
  },
  'ciento': {
    planq: '0xd2d19c4AdEEB88b93527E3e8D1924F0Ba8325755',
  },
  'CirclePacific': {
    manta: '0xD8c3DBE9C3953Fda5e4573533e662C58A37E1455',
  },
  'citadelswap': {
    base: '0xbe720274c24b5ec773559b8c7e28c2503dac7645',
  },
  'cl-dex': {
    klaytn: '0x93fa0E1deE99ac4158a617a6EC79cB941bD9a39F',
  },
  'clever-protocol': {
    dogechain: '0xf5833b5f514613beB33b4259a08aa64326E95c53',
  },
  'cobraswap': {
    bsc: '0x3165d94dd2f71381495cb897832de02710a0dce5',
  },
  'coinswap': {
    bsc: '0xC2D8d27F3196D9989aBf366230a47384010440c0',
  },
  'comet-swap-v2': {
    astar: '0x2a5d54C0E8B24e73D2b94fb1c1B1A61459F42a0D',
  },
  'comfyswap': {
    op_bnb: '0x9946468d90DE3fD885b7FEE9BF73a956Dc363349',
    shibarium: '0x09aBAdE821e55d7944965688eA6699a9830BAE45',
  },
  'complus': {
    avax: '0x5c02e78a3969d0e64aa2cfa765acc1d671914ac0',
    bsc: '0xdf97982bf70be91df4acd3d511c551f06a0d19ec',
    heco: '0xc32cccf795940ca8491cd4f31161509db28ab719',
    polygon: '0x973c934137dd687eca67bdd1c5a8b74286964ac6',
  },
  'cone': {
    _options: {
      hasStablePools: true,
    },
    bsc: '0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016',
  },
  'convergence': {
    start: '2021-05-17',
    ethereum: '0x4eef5746ED22A2fD368629C1852365bf5dcb79f1',
    moonbeam: '0x9504d0d43189d208459e15c7f643aac1abe3735d',
  },
  'cookiebase': {
    base: '0x05b00D63DbC67874ad44d039213b7DAfB999d184',
  },
  'coreswap': {
    core: '0x97814a1F542aFe7fd02de53926621b0D40e8Ad6C',
  },
  'crodex': {
    cronos: '0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F',
  },
  'cronus': {
    evmos: '0x20570b7bFf86B2f92068622D0805160f318554Be',
  },
  'crowfi': {
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
  'crust-finance': {
    _options: {
      hasStablePools: true,
    },
    mantle: '0x62DbCa39067f99C9D788a253cB325c6BA50e51cE',
  },
  'cuanswap': {
    core: '0x23556027Ad3C3e76160AcA51e8098C395a6d815C',
  },
  'cubiswap': {
    _options: {
      permitFailure: true,
    },
    op_bnb: '0xE6c8488a3078f474D0B75E4ac06a369e3Fb39d76',
  },
  'cyberblast-v2': {
    blast: '0x32132625Cd02988Fb105FbbD3138bD383df3aF65',
  },
  'cypher-v2': {
    start: '2025-11-22',
    ethereum: '0xCc8e4C2998395E56D06D985ba791138Edf48a8d4',
  },
  'daiko-dex': {
    deadFrom: '2024-06-07',
    hallmarks: [
      ['2024-06-07', 'Rug Pull'],
    ],
    taiko: '0x2cFAe8F731D6a04f3E868deB03ad73576695271A',
  },
  'dalmatiandex': {
    shibarium: '0x80108b858e04d5a35EF7dA7A67Cf45eeD18abf27',
  },
  'daoaas-swap': {
    eni: '0x548C0E26CE90B333c07abb6d55546304D46d269d',
  },
  'daomaker-swap': {
    bsc: '0x940BEb635cbEeC04720AC97FADb97205676e6aa4',
  },
  'darkswap': {
    dogechain: '0x643038270f316552A4FBfd5c100489982d076f86',
  },
  'dbx-finance': {
    arbitrum: '0x41755a88d4ab443d5d8ef73ec64dd3df71fb5559',
  },
  'defi-swap': {
    start: '2020-09-08',
    ethereum: '0x9DEB29c9a4c7A88a3C0257393b7f3335338D9A9D',
  },
  'definix': {
    bsc: '0x43eBb0cb9bD53A3Ed928Dd662095aCE1cef92D19',
    klaytn: '0xdee3df2560bceb55d3d7ef12f76dcb01785e6b29',
  },
  'degendex-fi': {
    degen: '0x45c1f8AF23Ea55e51927EE9A4d456fa7BCc5F0Fe',
  },
  'degenswap': {
    degen: '0xA5E57CaB76caa09F66280F9Eb1529ed1059E87ba',
  },
  'Dexland': {
    core: '0x3D6Cb82318f8c5DAAA9498a379D047a369c1E4aA',
  },
  'dexswap-arbi': {
    arbitrum: '0x3E40739d8478c58f9B973266974C58998D4F9e8b',
  },
  'dfs-v2': {
    xlayer: '0x32f2C88B2096088CF0e5Ea67D62ee1bf950d5D6e',
  },
  'dfyn': {
    fantom: '0xd9820a17053d6314B20642E465a84Bf01a3D64f5',
    okexchain: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
    polygon: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
  },
  'dinosaureggs': {
    bsc: '0x73d9f93d53505cb8c4c7f952ae42450d9e859d10',
  },
  'direct-exchange': {
    kava: '0xcE08c3d20Ff00a9Cf0D28922768bD606592B5D4C',
  },
  'diviswap': {
    chz: '0xbdd9c322ecf401e09c9d2dca3be46a7e45d48bb1',
  },
  'dmusk': {
    dogechain: '0x4e5E0739231A3BdE1c51188aCfEabC19983541E6',
  },
  'DogeShrek': {
    hallmarks: [
      ['2023-10-25', 'Rebranded as Chewyswap'],
    ],
    deadFrom: '2023-10-25',
    dogechain: '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A',
  },
  'dogswap': {
    shibarium: '0xA780FcBFF7c5232FDbEF4fc67313bEcFfdf64172',
  },
  'dojoswap-ancient8': {
    ancient8: '0x7d6eb409e2540d27Ea6Dc976E1a549a3dBcBfFBC',
  },
  'donkeswap': {
    sei: '0x4B4746216214f9e972c5D35D3Fe88e6Ec4C28A6B',
  },
  'doveswap': {
    polygon_zkevm: '0xeA2709fCD78141976803C3aecA23eCEa3Cb9cb41',
  },
  'dracula-era': {
    _options: {
      hasStablePools: true,
    },
    era: '0x68e03D7B8B3F9669750C1282AD6d36988f4FE18e',
  },
  'dragonswap': {
    klaytn: '0x224302153096E3ba16c4423d9Ba102D365a94B2B',
  },
  'dragonswap-sei': {
    sei: '0x71f6b49ae1558357bbb5a6074f1143c46cbca03d',
  },
  'dtx-dex': {
    taiko: '0x2EA9051d5a48eA2350b26306f2b959D262cf67e1',
  },
  'duckydefi': {
    cronos: '0x796E38Bb00f39a3D39ab75297D8d6202505f52e2',
  },
  'duneswap': {
    oasis: '0x9dd422B52618f4eDD13E08c840f2b6835F3C0585',
  },
  'dynastyswap-xyz': {
    pulse: '0x7abcEc2e35505aF1720431A6c414067717342B1F',
  },
  'dystopia': {
    _options: {
      hasStablePools: true,
    },
    polygon: '0x1d21Db6cde1b18c7E47B0F7F42f4b3F68b9beeC9',
  },
  'echodex': {
    linea: '0x6D1063F2187442Cc9adbFAD2f55A96B846FCB399',
  },
  'eggtartswap': {
    harmony: '0x65CED3c0Af7CDcC64Fb3eE5F021F9b4E65467812',
  },
  'electroswap-v2': {
    etn: '0x203D550ed6fA9dAB8A4190720CF9F65138abd15B',
  },
  'elephantdex': {
    harmony: '0x0Dea90EC11032615E027664D2708BC292Bbd976B',
  },
  'ElonSwap': {
    dogechain: '0x8B8CFD13ec09454E6440A4812ed306796a4Fb3eE',
  },
  'elvesdex': {
    _options: {
      permitFailure: true,
    },
    alv: '0xcadB0365436cbdB05D71C355F209AdaB214D8Dab',
  },
  'elysiumswap': {
    elsm: '0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE',
  },
  'empiredex': {
    avax: '0x06530550A48F990360DFD642d2132354A144F31d',
    bsc: '0x06530550A48F990360DFD642d2132354A144F31d',
    cronos: '0x06530550A48F990360DFD642d2132354A144F31d',
    empire: '0x06530550A48F990360DFD642d2132354A144F31d',
    ethereum: '0xd674b01E778CF43D3E6544985F893355F46A74A5',
    fantom: '0x06530550A48F990360DFD642d2132354A144F31d',
    kava: '0x06530550A48F990360DFD642d2132354A144F31d',
    polygon: '0x06530550A48F990360DFD642d2132354A144F31d',
    xdai: '0x06530550A48F990360DFD642d2132354A144F31d',
  },
  'energiswap': {
    energi: '0x875aDBaF8109c9CC9AbCC708a42607F573f594E4',
  },
  'energyfi': {
    moonbeam: '0x7c7EaEa389d958BB37a3fd08706Ca884D53Dc1F3',
  },
  'esper-finance': {
    mantle: '0x69C4515C926ac3db7A547044145495240961a7B5',
  },
  'etcmcv2': {
    ethereumclassic: '0x8148fc43c38796F794700d93482160F8c858D1Aa',
  },
  'etcswap': {
    ethereumclassic: '0x0307cd3d7da98a29e6ed0d2137be386ec1e4bc9c',
  },
  'eteria': {
    eteria: '0x3aE1EDcf59479ee99D2A7478E77AF1A442D85714',
  },
  'ethervista': {
    ethereum: '0x9a27cb5ae0B2cEe0bb71f9A85C0D60f3920757B4',
  },
  'ethwswap': {
    ethpow: '0x78376072F4945b2A5450B1A6B41a85ff20034527',
  },
  'excalibur': {
    fantom: '0x08b3CCa975a82cFA6f912E0eeDdE53A629770D3f',
  },
  'fairyswap': {
    findora: '0xA9a6E17a05c71BFe168CA972368F4b98774BF6C3',
  },
  'fairyswap-v2': {
    findora: '0xA2DD9611675927281070dB095599D31a8D4a007A',
  },
  'fathom-dex': {
    xdc: '0x9fAb572F75008A42c6aF80b36Ab20C76a38ABc4B',
  },
  'fcondex': {
    deadFrom: '2024-01-07',
    mantle: '0x3eF942017d51BA257c4B61BE2f8f641209C8b341',
  },
  'fedex': {
    op_bnb: '0xfb3AD00B272449AF3ea44e5C6ADbdfaB1655A046',
  },
  'fenix-v2': {
    _options: {
      hasStablePools: true,
    },
    blast: '0xa19c51d91891d3df7c13ed22a2f89d328a82950f',
  },
  'fizzswap-v2': {
    silicon_zk: '0xCB72354080A1d3B8A48425B889025d0799c52095',
  },
  'flair-dex': {
    _options: {
      hasStablePools: true,
    },
    avax: '0x634e02EB048eb1B5bDDc0CFdC20D34503E9B362d',
  },
  'FlashLiquidity': {
    polygon: '0x6e553d5f028bD747a27E138FA3109570081A23aE',
    polygon_zkevm: '0x6e553d5f028bD747a27E138FA3109570081A23aE',
    avax: '0x6e553d5f028bD747a27E138FA3109570081A23aE',
    base: '0x6e553d5f028bD747a27E138FA3109570081A23aE',
    arbitrum: '0x6e553d5f028bD747a27E138FA3109570081A23aE',
  },
  'flashpulse': {
    pulse: '0xD2871d0d39A9cb0cB0505309A5C1F521df25a987',
  },
  'FlitSwap': {
    op_bnb: '0x243f0218EF4cB8FC922ddd6d44e2DdE5b95DCa89',
  },
  'flow-swap-v2': {
    flow: '0x681D1bFE03522e0727730Ba02a05CD3C0a08fa30',
  },
  'fluxusbase': {
    _options: {
      hasStablePools: true,
    },
    base: '0x27c2d144b106B26Be3d0dEB6c14c5CFA2e9a507C',
  },
  'FomoSwap': {
    tara: '0x4a0Ff253BcE0CB539faC23517FFD968308220C5B',
  },
  'foodcourt': {
    bsc: '0xc801C7980c8C7900Bc898B1F38392b235fF64097',
    reichain: '0xC437190E5c4F85EbBdE74c86472900b323447603',
  },
  'forge-sx-dex': {
    arbitrum: '0x2f0a2b314eecc6ba33b3dd4f46816a2196c8af3a',
  },
  'fourdex': {
    op_bnb: '0x0f93649C2BA0F64fA939eCe899f1afD0b15C7Bd2',
  },
  'freeriver': {
    moonriver: '0x52abD262B13bef4E65Ff624880E8A0595a17af48',
  },
  'frogswap': {
    degen: '0xA994635243b55468B9C421559516BdE229E0930B',
  },
  'fstswap': {
    bsc: '0x9A272d734c5a0d7d84E0a892e891a553e8066dce',
  },
  'funbeast': {
    astar: '0xb99978440F310658C5E69D5042724327EF6D3CE7',
  },
  'fuseon': {
    _options: {
      hasStablePools: true,
    },
    plasma: '0x07A91205ee7d5a5d59B707B89Ef0c3434357e52B',
  },
  'fusionx-fi': {
    mantle: '0xe5020961fa51ffd3662cdf307def18f9a87cce7c',
  },
  'fvm': {
    _options: {
      hasStablePools: true,
    },
    fantom: '0x472f3C3c9608fe0aE8d702f3f8A2d12c410C881A',
  },
  'fwx-dex': {
    avax: '0x2131Bdb0E0B451BC1C5A53F2cBC80B16D43634Fa',
    base: '0x3512DA8F30D9AE6528e8e0787663C14Fe263Fbea',
  },
  'fxswap': {
    functionx: '0x9E229BE3812228454499FAf771b296bedFe8c904',
  },
  'galador-io': {
    mantle: '0x6F602b6F11F174c627813262fA713F334ca20aA6',
  },
  'gammaswap-deltaswap': {
    arbitrum: '0xcb85e1222f715a81b8edaeb73b28182fa37cffa8',
    base: '0x9a9a171c69cc811dc6b59bb2f9990e34a22fc971',
    ethereum: '0x5fbe219e88f6c6f214ce6f5b1fcaa0294f31ae1b',
  },
  'Gas404Swap': {
    bsc: '0xb6aC3914b53Cd3b39F11Fc9B380c3E605E994E20',
  },
  'gassss': {
    stable: '0x603EfDF29606BfB90f8f1068828c79cB2d5eD056',
  },
  'gassswap': {
    blast: '0x9637ac15c3830d9b32378593693f968cc33eecb1',
  },
  'gasturbo-io-dex': {
    arbitrum: '0x7e299DdF7E12663570dBfA8F3F20CB54f8fD04fA',
  },
  'gemswap': {
    hallmarks: [
      ['2023-04-14', "Rug Pull"]
    ],
    era: '0x065c8703132F2A38Be3d2dbF7Be6BE455930560c',
  },
  'ghost-ex': {
    blast: '0xbf246e99a848d9bf592c216118973204162d9650',
  },
  'ginfinance': {
    boba: '0x06350499760aa3ea20FEd2837321a84a92417f39',
  },
  'globiancedex': {
    xdc: '0xA8334Aae58e5bDee692B26679c1817F9c42f8f51',
  },
  'gloom': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    sonic: '0x385AC659B50dF7f90755f974409D02dc21ea8bB0',
  },
  'goatswap-v2': {
    goat: '0xbF8c8B5D27e76890416eA95a50d4732BB4906741',
  },
  'GoSwap': {
    gochain: '0xe93c2cD333902d8dd65bF9420B68fC7B1be94bB3',
  },
  'gravis-finance': {
    bsc: '0x4a3b76860c1b76f0403025485de7bfa1f08c48fd',
    heco: '0x4a3B76860C1b76f0403025485DE7bfa1F08C48fD',
    polygon: '0x17c1d25d5a2d833c266639de5fbe8896bdbeb234',
  },
  'gravity-finance': {
    polygon: '0x3ed75AfF4094d2Aaa38FaFCa64EF1C152ec1Cf20',
  },
  'greenhouse': {
    polygon: '0x75ED971834B0e176A053AC959D9Cf77F0B4c89D0',
  },
  'grokswap': {
    op_bnb: '0x01D434704aFf3edDb37eFB49f4bFE697e67b3BD0',
  },
  'grxswap': {
    grx: '0xc7316818841f355c5107753a3f3fdea799bd25f6',
  },
  'gt3': {
    polygon: '0x2d7360Db7216792cfc2c73B79C0cA629007E2af4',
  },
  'gullnetwork-amm': {
    manta: '0x31a78894a2B5dE2C4244cD41595CD0050a906Db3',
  },
  'gxypad': {
    era: '0xdCBA2077FE5261753AB29Cc886Bd5CFe1786a7D6',
  },
  'h2-finance': {
    cronos_zkevm: '0x50704Ac00064be03CEEd817f41E0Aa61F52ef4DC',
  },
  'hamburger': {
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0x989CF6bFA8997E8A01Fa07F3009392d1C734c719',
  },
  'hebeswap': {
    ethereumclassic: '0x09fafa5eecbc11C3e5d30369e51B7D9aab2f3F53',
  },
  'heraswap': {
    onus: '0x6CD368495D90b9Ba81660e2b35f7Ea2AcE2B8cD6',
  },
  'hercules-v2': {
    metis: '0xF38E7c7f8eA779e8A193B61f9155E6650CbAE095',
  },
  'hexaswap': {
    telos: '0x7853cDd20592aaff59D6e89B59bF67499564C525',
  },
  'hippowswap': {
    ethpow: '0x8cF9A887e53be909C221A2708E72898546dAB7Cc',
  },
  'hiveswap': {
    map: '0x29c3d087302e3fCb75F16175A09E4C39119459B2',
  },
  'honeyswap': {
    _options: {
      blacklistedTokens: ['0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75', '0x8db0a6d1b06950b4e81c4f67d1289fc7b9359c7f'],
    },
    polygon: '0x03daa61d8007443a6584e3d8f85105096543c19c',
    xdai: '0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7',
  },
  'hope-swap': {
    ethereum: '0x26F53fbADeEb777fb2A122dC703433d79241b64e',
  },
  'hopswap': {
    cronos: '0x918cefF586C00c1fa4726Dc50697172fd87df8e9',
  },
  'hpdex': {
    hpb: '0xE1d563BcFD4E2a5A9ce355CC8631421186521aAA',
  },
  'hunnyswap': {
    avax: '0x0c6A0061F9D0afB30152b8761a273786e51bec6d',
  },
  'hybra-v2': {
    _options: {
      hasStablePools: true,
    },
    hyperliquid: '0x9c7397c9C5ecC400992843408D3A283fE9108009',
  },
  'HyperBlast': {
    blast: '0xD97fFc2041a8aB8f6bc4aeE7eE8ECA485381D088',
  },
  'hyperjump': {
    bsc: '0xac653ce27e04c6ac565fd87f18128ad33ca03ba2',
    fantom: '0x991152411A7B5A14A8CF0cDDE8439435328070dF',
    metis: '0xAA1504c878B158906B78A471fD6bDbf328688aeB',
  },
  'hyperpie-v2-dex': {
    _options: {
      hasStablePools: true,
    },
    hyperliquid: '0xeAF40318453a81993569B14b898AAC31Df6133fA',
  },
  'hyperswap-v2': {
    hyperliquid: '0x724412C00059bf7d6ee7d4a1d0D5cd4de3ea1C48',
  },
  'hypertrade-v2': {
    hyperliquid: '0x4b6ac7503d3fd79ce23d7ae463d14aaaf07f6573',
  },
  'iceswap': {
    base: '0x79b8F15a3bEEcd5014B748499Ec89692665ea368',
  },
  'iguana-v2': {
    etlk: '0x3eebf549D2d8839E387B63796327eE2C8f64A0C4',
  },
  'in_dex': {
    hsk: '0x09ee9eCc6E2B458508E05Da7f90E324AE54620D2',
  },
  'incaswap': {
    matchain: '0x1d9e11881Fca0e692B09AF0C0cbE70A643CB06FB',
  },
  'infusion': {
    _options: {
      hasStablePools: true,
    },
    base: '0x2D9A3a2bd6400eE28d770c7254cA840c82faf23f',
  },
  'inkswap': {
    ink: '0xBD5B41358A6601924F1Fd708aF1535a671f530A9',
  },
  'inkyswap': {
    ink: '0x458C5d5B75ccBA22651D2C5b61cB1EA1e0b0f95D',
  },
  'inswap': {
    xlayer: '0xAa7b908653c1a2b713E64723F384B8AE7Ba5ab62',
  },
  'integral': {
    _options: {
      abis: {
        getReserves: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)',
      },
    },
    arbitrum: '0x717EF162cf831db83c51134734A15D1EBe9E516a',
    ethereum: '0xC480b33eE5229DE3FbDFAD1D2DCD3F3BAD0C56c6',
  },
  'issuaa': {
    _options: {
      hasStablePools: true,
      fetchBalances: true,
    },
    scroll: '0xC7e06CAF7880421cD21E98656B4755B3Df61537b',
  },
  'JaceSwap': {
    _options: {
      hasStablePools: true,
    },
    xlayer: '0x40E9fC0A18ccfDc87C19A1bA5b7F84FC51879600',
  },
  'jellybeanswap': {
    bsc: '0x320827adb3f759a386348b325c54803b2b3a7572',
  },
  'jibswap': {
    jbc: '0x4BBdA880C5A0cDcEc6510f0450c6C8bC5773D499',
  },
  'joc': {
    joc: '0x936e3Dc5F46a0fE1BdE6dB255e97B88fB675fEC2',
  },
  'jswap-finance': {
    okexchain: '0xd654CbF99F2907F06c88399AE123606121247D5C',
  },
  'juggler-red': {
    optimism: '0x0bef94f16ce5b7c83b0bdbd9924cf80239ba9837',
  },
  'julswap': {
    bsc: '0x553990F2CBA90272390f62C5BDb1681fFc899675',
  },
  'jumpdefi': {
    telos: '0xff59EBFf3e3F72E8162eA2aB0a0d1C9258692dF5',
  },
  'jupiterswap': {
    hallmarks: [
      ['2022-08-15', "incentives not given"]
    ],
    kava: '0xc08BAEA14C14f25bcafe3e3E05550715505eF3dE',
  },
  'justmoney': {
    bittorrent: '0x4dEb2f0976DC3Bf351555524B3A24A4feA4e137E',
    bsc: '0xF2Fb1b5Be475E7E1b3C31082C958e781f73a1712',
    ethereum: '0xd36Aba9Ec96523b0A89886c76065852aDFE2Eb39',
    polygon: '0xD36ABA9EC96523B0A89886C76065852ADFE2EB39',
    tron: 'TBfTeNjh7k8PbkTad8z6WS2vqh7SQZUfQ8',
  },
  'kapaswap': {
    kava: '0xAb9F1D773Bde5657BC1492dfaF57b0b9EB59FDDc',
  },
  'kapinus': {
    bsc: '0x70e881fa43a7124e36639b54162395451cef1922',
  },
  'kasavadex': {
    hallmarks: [
      ['2022-08-15', "incentives not given"]
    ],
    kava: '0x8F1fD6Ed57B0806FF114135F5b50B5f76e9542F2',
  },
  'kaspacom-dex': {
    kasplex: '0xa9CBa43A407c9Eb30933EA21f7b9D74A128D613c',
  },
  'katana-ronin': {
    hallmarks: [
      ['2022-05-28', "Ronin Bridge Hack $625m"],
    ],
    ronin: '0xb255d6a720bb7c39fee173ce22113397119cb930',
  },
  'katanaswap': {
    zeta: '0xc6ef2008a5a717329648420F429dA53d3351cF5E',
  },
  'kayen': {
    chz: '0xE2918AA38088878546c1A18F2F9b1BC83297fdD3',
  },
  'kdex': {
    kava: '0x9a6d197e85e61c23146F5b7FA55fc8a6EDDD2D57',
  },
  'kewl': {
    chz: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    avax: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    arbitrum: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    sonic: '0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0',
    base: '0x5636A64B835F4E3821C798fdA16E0bA106357646',
    bsc: '0x5636A64B835F4E3821C798fdA16E0bA106357646',
  },
  'kim-v2': {
    base: '0x14658340D7D1c112b62509bbF449be1897e8dE01',
    mode: '0xc02155946dd8C89D3D3238A6c8A64D04E2CD4500',
  },
  'kinetix-v2': {
    base: '0x8aD3d3e6B1b7B65138bD508E48330B544539b2C3',
    kava: '0xE8E917BC80A26CDacc9aA42C0F4965d2E1Fa52da',
  },
  'kittenswap': {
    hyperliquid: '0xDa12F450580A4cc485C3b501BAB7b0B3cbc3B31B',
  },
  'kittypunch': {
    flow: '0x29372c22459a4e373851798bFd6808e71EA34A71',
  },
  'kittypunch-kona-v2': {
    abstract: '0x7c2e370CA0fCb60D8202b8C5b01f758bcAD41860',
  },
  'kizuna': {
    mode: '0x05CDC3ec49C623dCE7947172fECFc5d3cD8d16cD',
  },
  'knightdex': {
    op_bnb: '0xAe9F4488CC751637b18070c5453a3b7Acc137a3b',
  },
  'kodiak-v2': {
    berachain: '0x5e705e184d233ff2a7cb1553793464a9d0c3028f',
  },
  'kodo-exchange': {
    _options: {
      hasStablePools: true,
    },
    taiko: '0x535E02960574d8155596a73c7Ad66e87e37Eb6Bc',
  },
  'koffeeswap': {
    kcc: '0xc0ffee00000e1439651c6ad025ea2a71ed7f3eab',
  },
  'kokomoswap': {
    bsc: '0x971A5f6Ef792bA565cdF61C904982419AA77989f',
  },
  'kokoswap': {
    bsc: '0x971A5f6Ef792bA565cdF61C904982419AA77989f',
  },
  'koone': {
    era: '0x6167ce530e710e29d0F32CFe50062028800e5918',
  },
  'kswap': {
    kava: '0xEFD3ad14E5cF09b0EbE435756337fb2e9D10Dc1a',
  },
  'kswapfinance': {
    okexchain: '0x60DCD4a2406Be12dbe3Bb2AaDa12cFb762A418c1',
  },
  'kuraswap-legacy': {
    _options: {
      hasStablePools: true,
    },
    sei: '0xAEbdA18889D6412E237e465cA25F5F346672A2eC',
  },
  'kuswap': {
    kcc: '0xAE46cBBCDFBa3bE0F02F463Ec5486eBB4e2e65Ae',
  },
  'laserswap': {
    thundercore: '0x23c7FA9A9f81B322684F25b8079e22C37e00b46b',
  },
  'LemonBlast': {
    blast: '0x31329BcDC90faD4d65764ccf91f833ec1d5fB5A4',
  },
  'lfgswap': {
    ethpow: '0xf66cef53c518659bFA0A9a4Aa07445AF08bf9B3a',
  },
  'lfgswap-arbitrum': {
    arbitrum: '0xE5552e0318531F9Ec585c83bDc8956C08Bf74b71',
  },
  'lfgswap-xlayer': {
    xlayer: '0x0F6DcC7a1B4665b93f1c639527336540B2076449',
  },
  'linehub-v2': {
    linea: '0x7811DeF28977060784cC509641f2DD23584b7671',
  },
  'linkswap': {
    zklink: '0x87929083ac2215cF3CE4936857D314aF6687C978',
  },
  'liquid-bolt': {
    arbitrum: '0x3D225a66c4A609634fb2c2d75d30Fd6610EBb1BD',
    bsc: '0xBDEc20d9cdf8E222EDd536268A9883a4C2ca172D',
    fantom: '0xdE08A0860B5971201f4d621B6eD4bb5BFed454be',
    polygon: '0xF301aE81800Aa97f68148531D487696EF939170E',
  },
  'Liquify': {
    _options: {
      hasStablePools: true,
    },
    core: '0x0Ed2a54c8fD6dcc3cF0f8fd97c748438f0f32eAD',
  },
  'Liquify-Manta': {
    _options: {
      hasStablePools: true,
    },
    manta: '0x951f08e103570C0385649B24bE892eefFb5Ce067',
  },
  'lithos': {
    plasma: '0x71a870D1c935C2146b87644DF3B5316e8756aE18',
  },
  'LizardExchange': {
    oasis: '0xefA6861931991CCE372c477a015619A21dfEBE8c',
  },
  'lobsterswap': {
    bsc: '0xF936CDe5138282eDC6370F9f5ac70d9a1AFC6F78',
    ozone: '0xE6E64C926af9ABEc9D819f52c9572AB961CEF6C1',
  },
  'lootswap': {
    hallmarks: [
      ['2022-06-23', "Horizon bridge Hack $100m"],
    ],
    harmony: '0x021AeF70c404aa9d70b71C615F17aB3a4038851A',
  },
  'lotusdex-v2': {
    mantra: '0xf8f54C91E868c7CF87774C388B6793807921BAa1',
  },
  'lovelyswap-v2': {
    bsc: '0x7db16925214B2F5D65dB741D59208A1187B9961c',
    base: '0x7db16925214B2F5D65dB741D59208A1187B9961c',
    polygon: '0x177aeb3727c91c4796766336923c4da431c59637',
  },
  'luaswap': {
    _options: {
      permitFailure: true,
    },
    ethereum: '0x0388C1E0f210AbAe597B7DE712B9510C6C36C857',
    tomochain: '0x28c79368257CD71A122409330ad2bEBA7277a396',
  },
  'LuigiSwap': {
    op_bnb: '0x0dAe6d22182c20AB9150a4DCB3160591Dc41027a',
    scroll: '0x0dAe6d22182c20AB9150a4DCB3160591Dc41027a',
  },
  'lydia': {
    _options: {
      blacklistedTokens: ['0xc1a49c0b9c10f35850bd8e15eaef0346be63e002'],
    },
    avax: '0xe0C1bb6DF4851feEEdc3E14Bd509FEAF428f7655',
  },
  'machinex-legacy': {
    _options: {
      hasStablePools: true,
    },
    peaq: '0xA3f356f0403b4f10345cD95E0C80483FDdD63Ebd',
  },
  'madness-finance': {
    monad: '0x93d71152A93619c0b10A2EFc856AC46120FD01Ab',
  },
  'magicfox': {
    _options: {
      hasStablePools: true,
    },
    polygon: '0xa2d23C7Ca6D360D5B0b30CaFF79dbBfa242B4811',
    bsc: '0xcEDa3234D7D5b36114d886682A399c6d126A03e0',
    arbitrum: '0xBd7A8c05D0eB214e3C5cc63D4B77C2Ea38bDe440',
  },
  'magicianmv': {
    polygon: '0xf08ae17c2a2728a788bb1b6c243fe7eb3e5bbadc',
  },
  'ManaSwap': {
    hyperliquid: '0x46BC787Bf21D9178f2dEbAD939e76c7E9Dd0A392',
  },
  'mantaswap': {
    hallmarks: [
      ['2023-10-09', "Rug Pull"]
    ],
    manta: '0x60Ad4aB0659C3b83320f3D43d3797553b55D52c6',
  },
  'manxswap': {
    manta: '0xFF073cEd2867F7085eC058f5C5Bd6Cf0d9B1Af8f',
  },
  'mateswap-xyz': {
    lac: '0x12D9CC71b28B70d08f28CCf92d9Ab1D8400f97bD',
  },
  'megalon': {
    era: '0xb618Db8D97db96f31C1eb0Fb99D9b5b372c2BdD3',
  },
  'melegaswap': {
    _options: {
      blacklistedTokens: ['0x1a515bf4e35AA2DF67109281DE6B3b00Ec37675E', '0x963556de0eb8138e97a85f0a86ee0acd159d210b'],
    },
    bsc: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
  },
  'memebox-fi': {
    sonic: '0x079463f811e6EB2E226908E79144CDDB59a7fB71',
  },
  'memedex': {
    conflux: '0x62283c20Ac4c7B1E61BB3C27bE2fA0880ee982Ea',
  },
  'meridian-swap': {
    telos: '0x1F2542D8F784565D526eeaDC9F1ca8Fbb75e5996',
  },
  'metavault-amm-v2': {
    scroll: '0xCc570Ec20eCB62cd9589FA33724514BDBc98DC7E',
    linea: '0xCc570Ec20eCB62cd9589FA33724514BDBc98DC7E',
  },
  'metropolis-exchange-amm': {
    sonic: '0x1570300e9cFEC66c9Fb0C8bc14366C86EB170Ad0',
  },
  'mezo-tigris': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    mezo: '0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248',
  },
  'miaswap': {
    _options: {
      blacklistedTokens: ['0xa6b9579563a48a0540bb53853ae0947972371169', '0xff276c6bca1f66fd54a8915e830735d6ab0c7b09'],
    },
    onus: '0xA5DA4dC244c7aD33a0D8a10Ed5d8cFf078E86Ef3',
  },
  'mimoswap': {
    iotex: '0xda257cBe968202Dea212bBB65aB49f174Da58b9D',
  },
  'minerswap': {
    ethpow: '0x91836d77af0a5fda36c5a1f3c11dbc7766de4d03',
  },
  'minidex': {
    ethereum: '0x1E2C2102cf8EfCaAAf20fFe926469EC7cD0d0f6E',
  },
  'moai-fi-v2': {
    xrplevm: '0x645541A2e2fb655fd7765898DFfbc7dd051E5B67',
  },
  'mobiusdex-xyz': {
    sonic: '0x475f2dDfA1A5da19F4a3F282F1305f285E742C45',
  },
  'mobydex': {
    op_bnb: '0x9864C78acCe7837Ad1DA8f9BbECcf2dbE562e698',
  },
  'modemax-dex': {
    mode: '0x423A079C43e4eD7ca561Ef04765eDB796F0Ec6c6',
  },
  'modeswap': {
    mode: '0x50fd14f0eba5a678c1ebc16bdd3794f09362a95c',
  },
  'modSwapDefi': {
    mode: '0x703ADd44002379AD963d6Cc506b8F2292C831644',
  },
  'monoswap-v2': {
    blast: '0xE27cb06A15230A7480d02956a3521E78C5bFD2D0',
  },
  'moonlift': {
    bsc: '0xe9cABbC746C03010020Fd093cD666e40823E0D87',
  },
  'moonswap': {
    _options: {
      blacklistedTokens: ['0xfd301ca82d007880e678bb750a771550c5104ff2'],
    },
    moonriver: '0x056973f631a5533470143bb7010c9229c19c04d2',
  },
  'mswap': {
    matchain: '0x338bCC4efd3cA000D123d7352b362Fc6D5B3D829',
  },
  'mtt-dex': {
    mtt_network: '0x6e9400a1501D934771cD9aeD16A3f33A0CE3F9f5',
  },
  'multex': {
    shape: '0x74Eac16615ed3b5A8Df2d00d72C72780beDED02A',
  },
  'mustcometh': {
    polygon: '0x800b052609c355cA8103E06F022aA30647eAd60a',
  },
  'mversex': {
    kava: '0x266F951c525130a4E230bB40F0e3525C6C99B9c5',
  },
  'nanoswap': {
    base: '0x41726eb94341fD27D5103DF3Cd6C387560c75B70',
  },
  'narwhalswap': {
    bsc: '0xB9fA84912FF2383a617d8b433E926Adf0Dd3FEa1',
  },
  'nearpad': {
    aurora: '0x34484b4E416f5d4B45D4Add0B6eF6Ca08FcED8f1',
  },
  'neptunex': {
    blast: '0x922FeCbE8dbFDfe85FfF4734046347B8E2ee7c82',
  },
  'nest-platform-v2': {
    _options: {
      hasStablePools: true,
    },
    hyperliquid: '0x889fd0ada8453c7619cd7f11e9029a1f0848fdf5',
  },
  'netswap': {
    metis: '0x70f51d68D16e8f9e418441280342BD43AC9Dff9f',
  },
  'nexus-dex': {
    xdc: '0xAf2977827a72e3CfE18104b0EDAF61Dd0689cd31',
  },
  'niifi': {
    nahmii: '0xe3DcF89D0c90A877cD82283EdFA7C3Bd03e77E86',
  },
  'nowswap': {
    hallmarks: [
      ['2021-09-15', "Hacked"]
    ],
    ethereum: '0xa556E2d77060A42516C9A8002E9156d8d3c832CE',
  },
  'noxa-fi': {
    abstract: '0xE1e98623082f662BCA1009a05382758f86F133b3',
  },
  'oaswap': {
    oasis: '0x84b11e8fb9a5dE10347eEA24c73d02B835505FDd',
  },
  'ocelex-v1': {
    _options: {
      hasStablePools: true,
    },
    zircuit: '0xdd018347c29a27088eb2d0bf0637d9a05b30666c',
  },
  'ocelot-dex': {
    zeta: '0xA26E383c04013fB43F9E0b9F7903431d12FEa6d6',
  },
  'octopow': {
    ethpow: '0x3a69E908fA1614e445720Ab816a0CD51e5dc6FeC',
  },
  'octoswap-classic': {
    monad: '0xCe104732685B9D7b2F07A09d828F6b19786cdA32',
  },
  'okcswap': {
    okexchain: '0x7b9F0a56cA7D20A44f603C03C6f45Db95b31e539',
  },
  'okieswap-v2': {
    xlayer: '0xF1cBfB1b12408dEDbA6Dcd7BB57730bAef6584fB',
  },
  'okutrade-goat': {
    goat: '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
  },
  'omaxswap': {
    omax: '0xEbB321f840c1F1d63a62b01F464D6921bfC3dD08',
  },
  'omni-exchange-v2': {
    arbitrum: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
    avax: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
    base: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
    bsc: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
    optimism: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
    plasma: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
    sonic: '0x7d9D51267f7e9e6b46a48E0A75c0086F46777087',
  },
  'omnidex': {
    telos: '0x7a2A35706f5d1CeE2faa8A254dd6F6D7d7Becc25',
  },
  'Omnidrome': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    zeta: '0x769d1BcB5FDf30F5a9D19f1ab8A3cF8b60a6e855',
  },
  'onavax': {
    avax: '0xE01cF83a89e8C32C0A9f91aCa7BfE554EBEE7141',
  },
  'onionswap': {
    base: '0xE196d4903999b00a90Cc8d0fc017e01017fd58D6',
  },
  'onsenswap': {
    start: '2023-04-22',
    era: '0x0E15a1a03bD356B17F576c50d23BF7FC00305590',
  },
  'oolongswap': {
    hallmarks: [
      ['2022-07-20', "Alameda Research exits"],
    ],
    boba: '0x7DDaF116889D655D1c486bEB95017a8211265d29',
  },
  'oortswap': {
    rei: '0xac15fe2C74bD635EfAF687F302633C7e5EbfF973',
  },
  'OpankeSwap': {
    op_bnb: '0x4523A7f5414bAc9BfbDfc6eF0932Bf580C3cf9f1',
  },
  'opbanana': {
    op_bnb: '0xdF9161aa1D60f129E185D43e2862BD4826E88Aa8',
  },
  'openex': {
    core: '0x6Edf8aecAA888896385d7fA19D2AA4eaff3C10D8',
  },
  'openswap': {
    rss3_vsl: '0x2F6d9dac92e197bE02aC2DE8BBD7E02837E2dB8d',
  },
  'openswap_harmony': {
    hallmarks: [
      ['2022-06-23', "Horizon bridge Hack $100m"],
    ],
    _options: {
      blacklistedTokens: ['0xed0b4b0f0e2c17646682fc98ace09feb99af3ade']
    },
    harmony: '0x5d2f9817303b940c9bb4f47c8c566c5c034d9848',
  },
  'OreSwap': {
    core: '0xbA862e0B955c612EEd514E722c84F1E70962457e',
  },
  'pacificswap': {
    manta: '0x19405689008954ccddbc8c7ef2b64dd88b4a674a',
  },
  'pandaswap': {
    bsc: '0x9ad32bf5dafe152cbe027398219611db4e8753b3',
  },
  'pandora-digital': {
    bsc: '0xFf9A4E72405Df3ca3D909523229677e6B2b8dC71',
  },
  'pandoraswap': {
    astar: '0x8D4f9b98FC21787382647BFCfC9ce75C08B50481',
  },
  'pankuku': {
    bsc: '0x24dF3F586b3d313A98704478f83a4315ae5b19A9',
  },
  'pantherswap': {
    bsc: '0x670f55c6284c629c23baE99F585e3f17E8b9FC31',
  },
  'papyrusswap': {
    scroll: '0xD5f3D3fb72210bfe71a59c05e0b8D72973baa2a6',
  },
  'paraluni-dex': {
    hallmarks: [
      ['2022-05-02', 'launch new dex'],
    ],
    bsc: '0xf3b426a160686082447545e1150829ee5485a91a',
  },
  'parity-dex': {
    _options: {
      hasStablePools: true,
    },
    monad: '0x6DBb0b5B201d02aD74B137617658543ecf800170',
  },
  'PattieSwap': {
    bsc: '0x71f6a913b317d2BF0Bf51Fd48d90e4cC6e62C4Dd',
  },
  'pearlfi': {
    _options: {
      hasStablePools: true,
    },
    polygon: '0xEaF188cdd22fEEBCb345DCb529Aa18CA9FcB4FBd',
  },
  'pegasys': {
    syscoin: '0x7Bbbb6abaD521dE677aBe089C85b29e3b2021496',
  },
  'pepedex': {
    ethereum: '0x460b2005b3318982feADA99f7ebF13e1D6f6eFfE',
  },
  'perfectswap': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    arbitrum: '0xC7ee0B06c2d9c97589bEa593c6E9F6965451Fe93',
  },
  'pheasantswap': {
    enuls: '0x7bf960B15Cbd9976042257Be3F6Bb2361E107384',
  },
  'phenix-dex': {
    cronos: '0x6Bae09822c36a9359d563A22fc7d134eF27a5f60',
    polygon: '0x9A3F01dfA086C2E234fC88742c692368438fBb30',
  },
  'photonswap': {
    cronos: '0x462C98Cae5AffEED576c98A55dAA922604e2D875',
    evmos: '0x1c671d6fEC45Ec0de88C82e6D8536bFe33F00c8a',
    kava: '0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5',
  },
  'PinSwap': {
    iotex: '0x0A753dD1AFDE272a2d4bf55dF616568744201577',
  },
  'piperx-v2': {
    sty: '0x6D3e2f58954bf4E1d0C4bA26a85a1b49b2e244C6',
  },
  'pixelswap': {
    arbitrum: '0x8435bd22e705DCeFCf6EF8b921E6dB534a4E9902',
    base: '0x8435bd22e705DCeFCf6EF8b921E6dB534a4E9902',
    era: '0x8435bd22e705DCeFCf6EF8b921E6dB534a4E9902',
    linea: '0x8435bd22e705DCeFCf6EF8b921E6dB534a4E9902',
    op_bnb: '0x8435bd22e705DCeFCf6EF8b921E6dB534a4E9902',
    scroll: '0xD07739a9E9C46D3DedeD97c0edC49cea8BAB1Bb9',
  },
  'planar-finance': {
    start: '2024-05-10',
    blast: '0xdC401B87Ee940F5050f6a17f49763635653eb496',
  },
  'planet-blue': {
    bsc: '0xa053582601214FEb3778031a002135cbBB7DBa18',
  },
  'pls2e': {
    bsc: '0x0944AB692786D9104AE9a29778285c41C33c0415',
  },
  'plunderswap': {
    zilliqa: '0xf42d1058f233329185A36B04B7f96105afa1adD2',
  },
  'polydex': {
    polygon: '0xEAA98F7b5f7BfbcD1aF14D0efAa9d9e68D82f640',
  },
  'polyDEX-cryption-network': {
    polygon: '0x5bdd1cd910e3307582f213b33699e676e61dead9',
  },
  'pond': {
    fuse: '0x1d1f1A7280D67246665Bb196F38553b469294f3a',
  },
  'ponyswap': {
    arbitrum: '0x66020547Ce3c861dec7632495D86e1b93dA6542c',
  },
  'PoorExchange': {
    arbitrum: '0x9fA0988D9e4b6362e0aaA02D1A09196a78c177e1',
  },
  'potatoswap': {
    xlayer: '0x630db8e822805c82ca40a54dae02dd5ac31f7fcf',
  },
  'powerswap': {
    ethpow: '0xD51CFEb0fa23101f67cF62EB02D0a82A4BaD52b7',
  },
  'PowSea': {
    ethpow: '0x1Ee0fe7f80BeA6353b137B2E7DCA9e26F3c6F442',
  },
  'powswap': {
    ethpow: '0x62009bD6349A3A1d7f1bcC7C69492Cd26F1FBF75',
  },
  'printy': {
    _options: {
      hasStablePools: true,
    },
    avax: '0xc62Ca231Cd2b0c530C622269dA02374134511a36',
  },
  'Produs': {
    bsc: '0x8ae5527706446943cBA8589313EC217a4a7288a4',
  },
  'protofi': {
    fantom: '0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76',
  },
  'PulseGun': {
    pulse: '0x5c92d17f52987DED8D2c0Fa0d5fbfcD68A09B074',
  },
  'pulsex': {
    pulse: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
  },
  'pumex': {
    _options: {
      hasStablePools: true,
    },
    injective: '0x105A0A9c1D9e29e0D68B746538895c94468108d2',
  },
  'punkswap': {
    op_bnb: '0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90',
    scroll: '0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90',
    shibarium: '0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90',
  },
  'pureswap': {
    bsc: '0x94b4188D143b9dD6bd7083aE38A461FcC6AAd07E',
  },
  'purple-bridge-dex': {
    polygon: '0x9c9238b2E47D61482D36deaFcDCD448D8bAAd75b',
  },
  'purps': {
    monad: '0xAfE4d3eB898591ACe6285176b26f0F5BEb894447',
  },
  'pyeswap': {
    bsc: '0xb664bdce35b5ee182e8832d4f3b615232e98a51e',
  },
  'quillswap': {
    hallmarks: [
      ['2023-10-24', 'Liquidity Removed'],
    ],
    scroll: '0xab8aEfe85faD683A6bDE16EeD04C3420C713324b',
  },
  'raccoonswap': {
    parex: '0x933A81E5d5aF4A182C1CE7FD0F96599Dd469e66A',
  },
  'rcpswap': {
    arbitrum_nova: '0xF9901551B4fDb1FE8d5617B5deB6074Bb8E1F6FB',
  },
  'reactor': {
    blast: '0xe9ecf70a6e8a00fafab980dc59ca7d3a4b800db9',
  },
  'redemption': {
    fantom: '0xa2dF50d1401afF182D19Bb41d76cf35953942c51',
  },
  'reservoir-tools-v2': {
    abstract: '0x566d7510dEE58360a64C9827257cF6D0Dc43985E',
    zero_network: '0x1B4427e212475B12e62f0f142b8AfEf3BC18B559',
    shape: '0xb411eaf2f2070822b26e372e3ea63c5060ba45e6',
    ink: '0xfe57a6ba1951f69ae2ed4abe23e0f095df500c04',
  },
  'revoswap': {
    xlayer: '0xa38498983e7b31DE851e36090bc9D1D8fB96BE5E',
  },
  'rexdex': {
    wan: '0xCc2F30462ED1C47Dd7Fb75C81c7F4Cd721eB2A66',
  },
  'rocketswap-cc': {
    base: '0x1b8128c3a1b7d20053d10763ff02466ca7ff99fc',
  },
  'rskswap': {
    rsk: '0xfaa7762f551bba9b0eba34d6443d49d0a577c0e1',
  },
  'ruby-exchange': {
    europa: '0x71f7BbbB33550fa5d70CA3F7eeAD87529f2DC3C8',
  },
  'safeswap': {
    ethereum: '0xB919aD419688F7C274f11F180112514941a910CB',
    polygon: '0x5be44d6C5634161CdaDcC2bc35389325aa493e83',
  },
  'saharaexchange': {
    oasis: '0x9D7B4519C7bED9a1e1307F8f84975DBc7a1D3C75',
  },
  'saitaswap': {
    bsc: '0x19e5ebc005688466d11015e646fa182621c1881e',
    ethereum: '0x35113a300ca0D7621374890ABFEAC30E88f214b1',
  },
  'sanctuary': {
    scroll: '0xAD71e466d6E9c5CbAC804dBF60dE2543d58B4b5B',
  },
  'sandyswap': {
    _options: {
      hasStablePools: true,
    },
    polygon_zkevm: '0xdb9908b6e0b87338194ae8627583194994bd992d',
  },
  'saru': {
    apechain: '0x57bfFa72db682f7eb6C132DAE03FF36bBEB0c459',
  },
  'satin': {
    _options: {
      hasStablePools: true,
    },
    polygon: '0x30030Aa4bc9bF07005cf61803ac8D0EB53e576eC',
  },
  'satoshiswap': {
    core: '0x8f5c03a1c86bf79ae0baC0D72E75aee662083e26',
  },
  'saucerswap': {
    hedera: '0x0000000000000000000000000000000000103780',
  },
  'savmdex': {
    bevm: '0xc008f29AaddA007b123919a5a0561c1B2E37864A',
  },
  'savmswap': {
    svm: '0x1842c9bD09bCba88b58776c7995A9A9bD220A925',
    prom: '0x3B73a7eDc9dfE4847a20BcCfEf6Eb1c90439f5C9',
  },
  'sboomfi': {
    sonic: '0x3638Ca700D67D560Be2A2d0DD471640957564829',
  },
  'scribeswap': {
    scroll: '0xb11826635f9253Bae9C426862b0f100950a71f8f',
  },
  'scrollswap': {
    scroll: '0x0082123Cf29a85f48Cd977D3000aec145A3B452F',
  },
  'scrollswapfinance': {
    scroll: '0xaA4b3b63B0A828dc28b2De7Be6115198B080De09',
  },
  'sealightswap': {
    polygon: '0xd0B30Fc63169bAaa3702ad7ec33EBe3f9e8627c0',
  },
  'seascape': {
    moonriver: '0xD184B1317125b166f01e8a0d6088ce1de61D00BA',
  },
  'secta-v2': {
    linea: '0x8Ad39bf99765E24012A28bEb0d444DE612903C43',
  },
  'seedfi-amm': {
    sseed: '0x76454AC9dF69875443D492128D059cE6e1A9091F',
  },
  'settlex-v2': {
    stable: '0x19E10fb5875C4901D9650aFc001197285dBBC060',
  },
  'sevenswap': {
    kava: '0x72b97F61fdb9a3aD34cd284B2f9c55d04127019c',
  },
  'shadow-legacy': {
    _options: {
      hasStablePools: true,
      blacklistedTokens: ['0xc31e2ac1a6fd9f80aaaa36a36530e035d2be8ac4'],
    },
    sonic: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8',
  },
  'shadowswap': {
    core: '0x326Ee96748E7DcC04BE1Ef8f4E4F6bdd54048932',
  },
  'sharelock': {
    era: '0xea51CE8A1f9C1Cbbf5B89D9B1dA4A94fB1557866',
  },
  'sharkswap': {
    sx: '0x6A482aC7f61Ed75B4Eb7C26cE8cD8a66bd07B88D',
    sxr: '0x610CfC3CBb3254fE69933a3Ab19aE1bF2aaaD7C8',
  },
  'sharkswap-finance': {
    base: '0x57592D44eb60011500961EF177BFf8D8691D5a8B',
  },
  'shekelswap': {
    arbitrum: '0xd78BA83aD495695940E97889E7191F717AfaC8E0',
  },
  'Shibafantom': {
    fantom: '0xeAcC845E4db0aB59A326513347a37ed4E999aBD8',
  },
  'shibanova': {
    bsc: '0x251912dE998ec91DFDf67EfBe032d6f4aB5EC485',
  },
  'shibaswap': {
    _options: {
      blacklistedTokens: [
        '0x6ADb2E268de2aA1aBF6578E4a8119b960E02928F',
        '0xab167E816E4d76089119900e941BEfdfA37d6b32',
        '0xF33893DE6eB6aE9A67442E066aE9aBd228f5290c',
        '0x84FA8f52E437Ac04107EC1768764B2b39287CB3e',
        '0x7121D00b4fA18F13Da6c2e30d19C04844E6AfDC8',
        '0xC1bfcCd4c29813eDe019D00D2179Eea838a67703'
      ],
    },
    ethereum: '0x115934131916c8b277dd010ee02de363c09d037c',
    shibarium: '0xc2b4218F137e3A5A9B98ab3AE804108F0D312CBC',
  },
  'shibbex': {
    shibarium: '0x6369e8dFaD8DB8378179D74C187f1D5DEa47Fa9F',
  },
  'shibshift': {
    pulse: '0xD56B9f53A1CAf0a6b66B209a54DAE5C5D40dE622',
  },
  'shimmersea': {
    shimmer_evm: '0x4fb5d3a06f5de2e88ce490e2e11d22b840d5ac47',
    iotaevm: '0x349aaAc3a500014981CBA11b64C76c66a6c1e8D0',
  },
  'shinobi': {
    ubiq: '0xba831e62ac14d8500cef0367b14f383d7b1b1b0a',
  },
  'sideswap-fi': {
    zkfair: '0x3F5a6e62cccD2C9AAF3dE431e127D65BC457000a',
  },
  'silkswap': {
    ftn: '0xd0c5d23290d63e06a0c4b87f14bd2f7aa551a895',
  },
  'skullswap': {
    fantom: '0x67BDF64a26A6B08f003580873448346c1C8bA93c',
  },
  'smartdex': {
    polygon: '0xBE087BeD88539d28664c9998FE3f180ea7b9749C',
  },
  'snap-v2': {
    tac: '0x2e9eB1Dd1F0462336a71dF52A6E387D207b6190f',
  },
  'solarflare': {
    moonbeam: '0x19B85ae92947E0725d5265fFB3389e7E4F191FDa',
  },
  'solidblast': {
    blast: '0x5a79cC04Ad1494A8Ec04cE5C1E25bB50A10111eA',
  },
  'solidex-finance-v2': {
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
  'solidlizard': {
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0x734d84631f00dC0d3FCD18b04b6cf42BFd407074',
  },
  'solidly': {
    _options: {
      hasStablePools: true,
    },
    fantom: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
  },
  'Solidpulse': {
    _options: {
      hasStablePools: true,
    },
    pulse: '0xEb60163cb688e4d605407025f761AA66B293d82D',
  },
  'solunea': {
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0x6ef065573cd3fff4c375d4d36e6ca93cd6e3d499',
    era: '0x5892Dc61d3f243Fa397197BaBC3Bb709Af4a0787',
  },
  'someswap': {
    monad: '0x00008A3c1077325Bb19cd93e5a0f1E95144700fa',
  },
  'somnex-xyz': {
    somnia: '0xaFd71143Fb155058e96527B07695D93223747ed1',
  },
  'somnia-exchange': {
    somnia: '0x6C4853C97b981Aa848C2b56F160a73a46b5DCCD4',
  },
  'sonefi-xyz': {
    soneium: '0x82d2d0aAE77967d42ACf4F30B53e2de0055338De',
  },
  'sonic-market-amm': {
    sonic: '0x01D6747dD2d65dDD90FAEC2C84727c2706ee28E2',
  },
  'sonicswap': {
    harmony: '0x653FB617210ca72DC938f8f4C75738F2B4b88d7B',
  },
  'sonicxswap': {
    sonic: '0x0569F2A6B281b139bC164851cf86E4a792ca6e81',
  },
  'sonusexchange': {
    soneium: '0xdb5D9562C80AEab3aeaED35ecaAe40Fd8DC9a4c8',
  },
  'soswap': {
    base: '0x539db2B4FE8016DB2594d7CfbeAb4d2B730b723E',
  },
  'spacefi': {
    evmos: '0x868A71EbfC46B86a676768C7b7aD65055CC293eE',
  },
  'spacefi-scroll': {
    scroll: '0x6cC370Ed99f1C11e7AC439F845d0BA6aed55cf50',
  },
  'spacefi-zksync': {
    era: '0x0700Fb51560CfC8F896B2c812499D17c5B0bF6A7',
  },
  'sparkdex-v2': {
    flare: '0x16b619B04c961E8f4F06C10B42FDAbb328980A89',
  },
  'spartacus-exchange': {
    fantom: '0x535646cf57E4155Df723bb24625f356d98ae9D2F',
  },
  'spartadex': {
    arbitrum: '0xFe8EC10Fe07A6a6f4A2584f8cD9FE232930eAF55',
    linea: '0x9E4Fc4a5A0769ba74088856C229c4a1Db2Ea5A9e',
  },
  'spinaqdex': {
    arbitrum: '0x36E0F99A19481976C42CC45Aec7205B10807E275',
  },
  'spookyswap': {
    bittorrent: '0xee4bc42157cf65291ba2fe839ae127e3cc76f741',
    eon: '0xa6AD18C2aC47803E193F75c3677b14BF19B94883',
    fantom: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
    sonic: '0xEE4bC42157cf65291Ba2FE839AE127e3Cc76f741',
  },
  'spoon-exchange': {
    _options: {
      hasStablePools: true,
    },
    core: '0x097665669d8bd2ad7554E1434A3B93a42F03b435',
  },
  'squidswap': {
    ink: '0x63b54dBBD2DAbf89D5c536746e534711f6094199',
  },
  'stableswap': {
    _options: {
      hasStablePools: true,
    },
    stable: '0x781a84FC7FA81267A15c9B06fbB80A043852B6D3',
  },
  'stableswap-dex': {
    _options: {
      hasStablePools: true,
    },
    stable: '0xc5ba86e4A6F674816fA7c3B7cA438D63ec136bE9',
  },
  'standard-tech': {
    ethereum: '0x53AC1d1FA4F9F6c604B8B198cE29A50d28cbA893',
    metis: '0xFA68bAAdBDCf014fA20bD1A4542967AE40Ddca53',
    shiden: '0x073386AE3292299a5814B00bC1ceB8f2bfC92c51',
  },
  'starmaker': {
    era: '0x7096Cebc52012e2611a1E88c45bC54ee2A88dcB4',
    mantle: '0x2a34936cd9441B7E7FB152c9C4e304be58e14830',
  },
  'step-exchange': {
    step: '0xf62b74E4a7aE8D27Cd983A54a9d24A89345413a5',
  },
  'sterling-finance': {
    _options: {
      hasStablePools: true,
    },
    arbitrum: '0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC',
  },
  'straxswap': {
    stratis: '0xDC29A634611914ed73261A71C8F20D828cA2c09F',
  },
  'sumswap': {
    ethereum: '0x96FF042f8c6757fCE515d171F194b5816CAFEe11',
  },
  'sunflowerswap': {
    moonbeam: '0xf6c49609e8d637c3d07133e28d369283b5e80c70',
  },
  'supernova': {
    _options: {
      hasStablePools: true,
    },
    ethereum: '0x5aef44edfc5a7edd30826c724ea12d7be15bdc30',
  },
  'superswap-v2': {
    _options: {
      permitFailure: true,
    },
    optimism: '0x22505cb4d5d10b2c848a9d75c57ea72a66066d8c',
  },
  'supswap-v2': {
    mode: '0x557f46F67a36E16Ff27e0a39C5DA6bFCB4Ff89c0',
  },
  'surfswap': {
    hallmarks: [
      ['2022-08-15', "incentives not given"]
    ],
    kava: '0xc449665520C5a40C9E88c7BaDa149f02241B1f9F',
  },
  'swanswap': {
    shape: '0x2Be0c88CCc1d42920beAe4633CDdBbACe5e8812c',
  },
  'swapbase': {
    base: '0x04C9f118d21e8B767D2e50C946f0cC9F6C367300',
  },
  'swapblast': {
    blast: '0x04C9f118d21e8B767D2e50C946f0cC9F6C367300',
  },
  'SwapMode': {
    mode: '0xfb926356BAf861c93C3557D7327Dbe8734A71891',
  },
  'swapos': {
    ethereum: '0xfB1Eb9a45Feb7269f3277233AF513482Bc04Ea63',
  },
  'swapp': {
    cronos: '0xEe4fa96b695De795071d40EEad0e8Fd42cdB9951',
  },
  'swapperchan': {
    boba: '0x3d97964506800d433fb5dbebdd0c202ec9b62557',
  },
  'swappi': {
    conflux: '0xe2a6f7c0ce4d5d300f97aa7e125455f5cd3342f5',
  },
  'swapx': {
    xone: '0x76bDc5a6190Ea31A6D5C7e93a8a2ff4dD15080A6',
  },
  'SwapX-v2': {
    _options: {
      hasStablePools: true,
    },
    sonic: '0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663',
  },
  'SweetSwap': {
    dogechain: '0xf1036CA4762cD601BDc630cd32942f90d19ED970',
  },
  'swipeswap': {
    bsc: '0x7810d4b7bc4f7faee9deec3242238a39c4f1197d',
    ethereum: '0x8a93b6865c4492ff17252219b87ea6920848edc0',
  },
  'swyrl-legacy': {
    _options: {
      hasStablePools: true,
    },
    monad: '0xD158CDfeC90E9429A290c3144Afeb72E8C23603a',
  },
  'tachyswap': {
    etlk: '0x033eff22bC5Bd30c597e1fdE8Ca6fB1C1274C688',
  },
  'taffy': {
    saakuru: '0xb9FFd4f89A86a989069CAcaE90e9ce824D0c4971',
  },
  'TAKOSWAP': {
    ogpu: '0xEC03D5dc44143257F72B5a8e900bF2aAa0E702B0',
  },
  'tarina': {
    avax: '0xb334a709dd2146caced08e698c05d4d22e2ac046',
  },
  'tealswap': {
    oas: '0x5200000000000000000000000000000000000018',
  },
  'tenx-exchange': {
    tenet: '0xbaB158ED71F7FD4AD43b1db1aAc5d0EFA0a8469f',
  },
  'tetu-swap': {
    polygon: '0x684d8c187be836171a1af8d533e4724893031828',
  },
  'themis-capital-dex': {
    filecoin: '0xe250A89d23F466c14B26BDF60a0DC3b54974FBE9',
  },
  'thena': {
    bsc: '0xafd89d21bdb66d00817d4153e055830b1c2b3970',
    op_bnb: '0xFC1bC666A98703505534477E651A2470508C99A4',
  },
  'thetaswap': {
    theta: '0xe8b97478ae8ab1fcfd46cdb2f62869ec63bbf69f',
  },
  'throne-v2': {
    base: '0xe4806BdD8E010828324928d25587721F6B58BEA2',
  },
  'titano-swych': {
    bsc: '0x80f112CD8Ac529d6993090A0c9a04E01d495BfBf',
  },
  'tokan-exchange': {
    _options: {
      hasStablePools: true,
    },
    scroll: '0x92aF10c685D2CF4CD845388C5f45aC5dc97C5024',
  },
  'tomb-swap': {
    fantom: '0xE236f6890F1824fa0a7ffc39b1597A5A6077Cfe9',
  },
  'Torr-Finance': {
    bittorrent: '0xea34610f4373c8d75ed1810A6096197F297F2786',
  },
  'torusfarm': {
    _options: {
      permitFailure: true,
    },
    base: '0x259b3217A01878ea9d64b45eE48231e660863ee7',
  },
  'tropicalswap': {
    mantle: '0x5B54d3610ec3f7FB1d5B42Ccf4DF0fB4e136f249',
  },
  'turtleswap': {
    methodology: 'TVL counts liquidity across TurtleSwap pools via factory reserves.',
    start: 1719964800,
    vechain: '0x7751a8Df07F7Ae6f9E92B06a363b3c020F2830aC',
  },
  'ubeswap': {
    celo: '0x62d5b84bE28a183aBB507E125B384122D2C25fAE',
  },
  'ucs-finance': {
    unichain: '0x1ee365b3230Cd52c17A7a40633A0C53b2f11411B',
  },
  'ultrasolid-v2': {
    hyperliquid: '0x2658665492d0394E86d50d55050453127A28C09b',
  },
  'unicly': {
    ethereum: '0xbacc776b231c571a7e6ab7bc2c8a099e07153377',
  },
  'uniwswap': {
    ethpow: '0xaBC4325bAD182076EAa5877c68437833d596D3Ee',
  },
  'upheaval-v2': {
    hyperliquid: '0x98e19A533FadB2C9853983772E4e7aa09a1478e0',
  },
  'usesugarswap': {
    era: '0x0A592988aBE9017a3c0285B9aa251A4bE8683394',
  },
  'uswap-me': {
    tron: 'TQ4F8Gr1qRKcMva64qYweAJNAVtgfj6ZJd',
  },
  'v2swap': {
    _options: {
      permitFailure: true,
    },
    op_bnb: '0x4811110638201b5878abe23e406DdA9De9Ad7B20',
  },
  'valleyswap': {
    hallmarks: [
      ['2023-04-17', "Remove Fake USDT"],
      ['2022-06-03', "EvoDefi bridge depeg"]
    ],
    _options: {
      blacklistedTokens: ['0x6Cb9750a92643382e020eA9a170AbB83Df05F30B', '0x94fbffe5698db6f54d6ca524dbe673a7729014be'],
    },
    oasis: '0xa25464822b505968eEc9A45C43765228c701d35f',
  },
  'vanillaswap-v2': {
    defichain_evm: '0x79Ea1b897deeF37e3e42cDB66ca35DaA799E93a3',
  },
  'vapordex': {
    apechain: '0xc009a670e2b02e21e7e75ae98e254f467f7ae257',
    avax: '0xc009a670e2b02e21e7e75ae98e254f467f7ae257',
    telos: '0xDef9ee39FD82ee57a1b789Bc877E2Cbd88fd5caE',
  },
  'VAX': {
    multivac: '0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD',
  },
  'velocimeter-v2': {
    _options: {
      hasStablePools: true,
    },
    base: '0xe21Aac7F113Bd5DC2389e4d8a8db854a87fD6951',
    canto: '0xF80909DF0A01ff18e4D37BF682E40519B21Def46',
    mantle: '0x99F9a4A96549342546f9DAE5B2738EDDcD43Bf4C',
    pulse: '0x6B4449C74a9aF269A5f72B88B2B7B8604685D9B9',
  },
  'velocimeter-v4': {
    _options: {
      hasStablePools: true,
    },
    iotaevm: '0x10A288eF87586BE54ea690998cAC82F7Cc90BC50',
  },
  'velodrome': {
    hallmarks: [
      ['2022-07-14', 'First OP grant awarded'],
      ['2022-08-04', 'Loss $350k Operational Funds'],
    ],
    _options: {
      hasStablePools: true,
    },
    optimism: '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746',
  },
  'veniceswap': {
    findora: '0x5a75C65a96445eD0a4dDC1C1E35DF24B1DA3fe6a',
  },
  'venuSwap': {
    zkfair: '0x4C72BF37eb72df730c22Df16ca594f6985130dD6',
  },
  'veplus': {
    _options: {
      hasStablePools: true,
    },
    bsc: '0x5Bcd9eE6C31dEf33334b255EE7A767B6EEDcBa4b',
  },
  'veRocket': {
    vechain: '0xbdc2EDaeA65B51053FFcE8Bc0721753c7895e12f',
  },
  'versa': {
    astar: '0x4346A7C8C39Bf91b8a80933c2fdb10d815c401dB',
  },
  'vexchange': {
    vechain: '0xB312582C023Cc4938CF0faEA2fd609b46D7509A2',
  },
  'virbicoin-dex': {
    _options: {
      fetchBalances: true,
    },
    virbicoin: '0x663B1b42B79077AaC918515D3f57FED6820Dad63',
  },
  'VoltageSwap': {
    scroll: '0x7328d0dcbCcDA2F5bBA6Ce866cC9478cc8c0F938',
  },
  'voltswap': {
    meter: '0x56aD9A9149685b290ffeC883937caE191e193135',
    theta: '0xa2De4F2cC54dDFdFb7D27E81b9b9772bd45bf89d',
  },
  'voltswap-v2': {
    base: '0x2A5478bE24F9E536cCb91DBF650EFD6cE6C00398',
    meter: '0xb33dE8C0843F90655ad6249F20B473a627443d21',
  },
  'vulcandex': {
    polygon: '0x293f45b6F9751316672da58AE87447d712AF85D7',
  },
  'vultureswap': {
    cronos: '0x45523BD2aB7E563E3a0F286be1F766e77546d579',
  },
  'vvs-finance': {
    cronos: '0x3b44b2a187a7b3824131f8db5a74194d0a42fc15',
  },
  'wagyuswap': {
    _options: {
      blacklistedTokens: [
        '0xcd7509b76281223f5b7d3ad5d47f8d7aa5c2b9bf',
      ],
    },
    velas: '0x69f3212344a38b35844cce4864c2af9c717f35e3',
  },
  'wakafinance': {
    fantom: '0xb2435253c71fca27be41206eb2793e44e1df6b6d',
  },
  'weero-v2': {
    _options: {
      fromBlock: 184616686,
    },
    klaytn: '0xdE9634D8A1b5855E3Ddb0B0712b28031e18865d9',
  },
  'wemix-fi': {
    wemix: '0xe1F36C7B919c9f893E2Cd30b471434Aa2494664A',
  },
  'winery-swap': {
    bsc: '0x79C342FddBBF376cA6B4EFAc7aaA457D6063F8Cb',
  },
  'woken': {
    arbitrum: '0x0Dee376e1DCB4DAE68837de8eE5aBE27e629Acd0',
    bsc: '0x0Dee376e1DCB4DAE68837de8eE5aBE27e629Acd0',
  },
  'woof': {
    shibarium: '0x42D6041342021Bc317796C6A0F10Ce39346E9167',
  },
  'woofswap': {
    _options: {
      hasStablePools: true,
    },
    shibarium: '0xB9fbdFA27B7ba8BB2d4bB4aB399e4c55F0F7F83a',
  },
  'woofswapGL': {
    _options: {
      hasStablePools: true,
    },
    gatelayer: '0xc850D2Ae73Cb81E2B74341534094BCcb4a366c24',
  },
  'xbased': {
    base: '0x7a9ACeB13bc00eEC11460A5D7122793461Da96E0',
  },
  'XDX': {
    blast: '0xF55dE36072beCebF162d2d54C49964f3b0683711',
  },
  'xenwave': {
    btn: '0xCba3Dc15Cfbcd900cF8133E39257c26727E86e3a',
  },
  'xops-finance': {
    op_bnb: '0x6b5F5C4E0076c5841726a3B20B87Eb0709741842',
  },
  'xrise33': {
    _options: {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      hasStablePools: true,
    },
    xrplevm: '0xa9833699fBB0E3759a3C381DeB43A61Df99e8544',
  },
  'xspswap': {
    xdc: '0x347D14b13a68457186b2450bb2a6c2Fd7B38352f',
  },
  'xswap': {
    crossfi: '0x3ca837175312070f4E4fF64972a199122Ee03805',
  },
  'yakafinance': {
    sei: '0xd45dAff288075952822d5323F1d571e73435E929',
  },
  'yapeswap': {
    ethereum: '0x46aDc1C052Fafd590F56C42e379d7d16622835a2',
  },
  'yetiswap': {
    avax: '0x58C8CD291Fa36130119E6dEb9E520fbb6AcA1c3a',
  },
  'yoshi-exchange': {
    fantom: '0xc5bc174cb6382fbab17771d05e6a918441deceea',
    bsc: '0x542b6524abf0bd47dc191504e38400ec14d0290c',
    ethereum: '0x773cadc167deafa46f603d96172fa45686c4fa58',
  },
  'youswap': {
    heco: '0x9f1cd0e59e78f5288e2fcf43030c9010d4f2991d',
    bsc: '0x137f34df5bcdb30f5e858fc77cb7ab60f8f7a09a',
    ethereum: '0xa7028337d3da1f04d638cc3b4dd09411486b49ea',
  },
  'yumiswap': {
    astar: '0xD3CFB8A232Ad5D0A7ABc817ae3BD1F3E7AE4b5E0',
  },
  'zappy': {
    telos: '0x4be5Bf2233a0fd2c7D1472487310503Ec8E857be',
  },
  'Zebra': {
    scroll: '0xa63eb44c67813cad20A9aE654641ddc918412941',
  },
  'zedaswap': {
    zeta: '0x61db4eecb460b88aa7dcbc9384152bfa2d24f306',
  },
  'zena-v2': {
    op_bnb: '0x8b4FC88973E5b8348640d35E49b1e9cE8AAc180A',
  },
  'zeniq-swap': {
    zeniq: '0x7D0cbcE25EaaB8D5434a53fB3B42077034a9bB99',
  },
  'Zenonswap': {
    degen: '0x97B162AD1443737B0500A5E726344D608eB9e255',
  },
  'zerodex': {
    avax: '0x2Ef422F30cdb7c5F1f7267AB5CF567A88974b308',
    bsc: '0x52abdb3536a3a966056e096f2572b2755df26eac',
    polygon: '0x6fd98cf211134081fe02f551d64cf89671d5443b',
  },
  'zkdefi': {
    polygon_zkevm: '0xfDC8ec444F482Fe8aFe0a00114548DC9ff729568',
  },
  'zkfairswap': {
    zkfair: '0xeA70460a5B0E3A94EC05b1AaFCe9e6Eb11C334A0',
  },
  'zkmoonswap': {
    polygon_zkevm: '0x49841094F19659e044671825d7ecb3B79368e6E5',
  },
  'zkswap-2': {
    hallmarks: [
      ['2024-01-10', "Whale Withdraw"]
    ],
    era: '0xeeE1Af1CE68D280e9cAfD861B7d4af776798F18d',
    zkfair: '0x028e8aB8C7556C7F42315f5afe08bB7392aA6878',
  },
  'zoodex': {
    fantom: '0x6178C3B21F7cA1adD84c16AD35452c85a85F5df4',
  },
  'zprotocol-dex': {
    scroll: '0xED93e976d43AF67Cc05aa9f6Ab3D2234358F0C81',
  },
  'zswap-plus': {
    avax: '0xcDE3F9e6D452be6d955B1C7AaAEE3cA397EAc469',
  },

  // --- Migrated simple getUniTVL adapters ---
  'GlyphExchange': {
    core: { factory: '0x3e723c7b6188e8ef638db9685af45c7cb66f77b9', staking: ["0x6bf16B2645b13db386ecE6038e1dEF76d95696fc", "0xb3A8F0f0da9ffC65318aA39E55079796093029AD"] },
  },
  'KibbleSwap': {
    dogechain: { factory: '0xF4bc79D32A7dEfd87c8A9C100FD83206bbF19Af5', staking: { owner: '0x8ffBD442F246964A0d2E87C9b2551095bdA6EEb3', tokens: ['0x1e1026ba0810e6391b0F86AFa8A9305c12713B66'], lps: ['0xC1C10b8BeeC82E840990A2c60A54ccdB39b2153F'], useDefaultCoreAssets: true } },
  },
  'Kwikswap': {
    ethereum: { factory: '0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d', staking: ["0x57Caec63E87e1496E946181e3Fc59086e589D4c0", "0x286c0936c7eaf6651099ab5dab9ee5a6cb5d229d"] },
    polygon: { factory: '0x0B29D7a989D6647E4A56eE9899DaF7535FF9620c', staking: ["0x7965e5F759caB3d5a1b737b9Bb24e94ef6747FA7", "0x8df74088b3aecfd0cb97bcfd053b173782f01e3a", "polygon"] },
    shiden: { factory: '0xf5fC2D145381A2eBAFb93Cc2B60fB2b97FB405aa', staking: ["0x212CB413c48221cA6fE2100578a9ABED26840380", "0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454", "shiden", "0x286c0936c7eaf6651099ab5dab9ee5a6cb5d229d"] },
    bsc: '0x64eBD6CaCece790e9C4DDeA1a24952Ddb2715279',
  },
  'Velocimeter': {
    _options: { hasStablePools: true },
    canto: { factory: '0xb12aF64E128A1D4489D13314eB4Df81cBCE126aC', staking: ["0x990efF367C6c4aece43c1E98099061c897730F27", "0x2Baec546a92cA3469f71b7A091f7dF61e5569889", "canto"] },
  },
  'Viridian': {
    methodology: 'TVL shows the sum of tokens deposited in our pools and Staking shows the number of $VIRI locked in the Voting Escrow contract.',
    _options: { hasStablePools: true },
    core: { factory: '0xb54a83cfEc6052E05BB2925097FAff0EC22893F3', staking: ["0x49360Bc1727113F56f5A256678AC27F93ee6D368", "0x189d2849AF2031e20c670E755Fa3F0121f2be409"] },
  },
  'afraswap': {
    methodology: 'Factory address (0xa098751D407796d773032f5Cc219c3e6889fB893) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    bsc: { factory: '0xa098751D407796d773032f5Cc219c3e6889fB893', staking: ["0x259C852834375864b65202375558AB11B2d330fd", "0x5badD826AeFa700446Fa6d784e6ff97eD6eeDca9", "0x1Da189c1BA3d718Cc431a2ed240a3753f89CD47A", "wbnb"] },
  },
  'alienbase': {
    methodology: 'Uses Uniswap-style factory address to find and price liquidity pairs.',
    base: { factory: '0x3E84D913803b02A4a7f027165E8cA42C14C0FdE7', staking: [["0x52eaecac2402633d98b95213d0b473e069d86590","0x365c6d588e8611125De3bEA5B9280C304FA54113"], "0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4"] },
  },
  'alienfi': {
    methodology: 'TVL consists of pools created by the factory contract',
    arbitrum: { factory: '0xac9d019B7c8B7a4bbAC64b2Dbf6791ED672ba98B', staking: { tokensAndOwners: [['0x6740Acb82ac5C63A7ad2397ee1faed7c788F5f8c', '0xCf8D01c1a20dabcC025368607020473cCb119F5C']], lps: ['0xE145A5710Be68C3C9C50c5288909E813c5e92F4e'] } },
  },
  'alita-finance': {
    bsc: { factory: '0xC7a506ab3ac668EAb6bF9eCf971433D6CFeF05D9', staking: ["0x4f7b2Be2bc3C61009e9aE520CCfc830612A10694", "0x557233E794d1a5FbCc6D26dca49147379ea5073c"] },
  },
  'aliumswap': {
    bsc: { factory: '0xbEAC7e750728e865A3cb39D5ED6E3A3044ae4B98', staking: [["0x95CDf618b6aF0ec1812290A777955D3609B0508d","0x4f388167F8B52F89C87A4E46706b9C1408F2c137"], "0x7C38870e93A1f959cB6c533eB10bBc3e438AaC11"] },
  },
  'ampleswap': {
    methodology: 'Uses factory(0x381fefadab5466bff0e8e96842e8e76a143e8f73) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    bsc: { factory: '0x381fefadab5466bff0e8e96842e8e76a143e8f73', staking: ["0xF5987603323AA99DDe0777a55E83C82D59cCA272", "0x19857937848c02afbde8b526610f0f2f89e9960d"] },
    alv: '0x01dC97C89DF7d3C616a696dD53F600aB3FF12983',
    dsc: { tvl: () => ({}) },
  },
  'apeswap-amm': {
    methodology: 'TVL comes from the DEX liquidity pools, staking TVL is accounted as the banana on 0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9 and 0x71354AC3c695dfB1d3f595AfA5D4364e9e06339B',
    bsc: { factory: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6', staking: [["0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9","0x71354AC3c695dfB1d3f595AfA5D4364e9e06339B"], ["0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95","0x34294AfABCbaFfc616ac6614F6d2e17260b78BEd"], "bsc"] },
    polygon: '0xcf083be4164828f00cae704ec15a36d711491284',
    ethereum: '0xBAe5dc9B19004883d0377419FeF3c2C8832d7d7B',
    telos: '0x411172Dfcd5f68307656A1ff35520841C2F7fAec',
    arbitrum: '0xCf083Be4164828f00cAE704EC15a36D711491284',
  },
  'arthswap': {
    astar: { factory: '0xA9473608514457b4bF083f9045fA63ae5810A03E', staking: ["0x42d175a498Cb517Ad29d055ea7DcFD3D99045404", "0xde2578edec4669ba7f41c5d5d2386300bcea4678"] },
  },
  'babydogeswap': {
    methodology: 'Total TVL in all farms and BabyDoge staking pool',
    _options: {
      blacklistedTokens: ['0xe320df552e78d57e95cf1182b6960746d5016561'],
    },
    bsc: { factory: '0x4693B62E5fc9c0a45F89D62e6300a03C85f43137', staking: ["0xcecd3e7eadae1ad0c94f53bf6a2af188df1a90d0", "0xc748673057861a797275CD8A068AbB95A902e8de"] },
  },
  'babyswap': {
    methodology: 'Uses factory(0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    bsc: { factory: '0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da', staking: ["0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730", "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657"] },
  },
  'biswap': {
    hallmarks: [
      ['2022-05-07', 'UST depeg'],
    ],
    bsc: { factory: '0x858e3312ed3a876947ea49d572a7c42de08af7ee', staking: [["0xDbc1A13490deeF9c3C12b44FE77b503c1B061739","0x13e9031133E901d5214fb4D593DF8ECc034c8237","0xD4855892a3188DA76da0066b9e4918939511E67a","0x9b9F3F1112E74765518cE93B1489c70F6db52bFf","0x683963df7331c65Df8ACE6818651a7611bdc39E5","0xBD09D5E5dcC904bbf8649af78d323eEfdf7b0D1D","0x8b10E6959F2915f532fE142b9C53B167eEC42fF4","0x7D621C9F70B3743CbAb15c22d781754FcD7c9589","0x1F337dea1679730906F46A06fd6034054BD32970","0x131010022654B57b0C39c918ef8313ce79Fa04B8","0x6653c3c4CD2083fEbFf49A52F9a5ce4c30978A25","0x44EeCE1e9ccbaa5Ad0b8C14192467Ab83BE0BA51","0xA394dD5ADC4AAF41aa1f9CFf28158A6AF2823459","0x6cBbA2f3BD677Da630aEd2311253713e8Ba1394D","0xa3A911033af250f7013597A6AF6a719906Ac4444","0xE42D17b1a734e04d2e0cB33234Ab074E21c175A7","0xAa2b37d023Ffa244022A9aa60EeB351cc79FD4e5","0x69C4c9cf979431DA6C4B4a2F3874E6378DFC8157","0xE056FB8Ce6A3437530B1AfF799185A009b25990b","0xf31F62A6Afb0546771a821e0F98FD187Ee7f7d4C","0x2792Ccd3F02a22beBa49F28F3ab0B52dF18BD280","0x109eAA8b5Ea469fb5aCe0647A93695D8DCD5e836"], "0x965f527d9159dce6288a2219db51fc6eef120dd1"] },
  },
  'bscswap': {
    methodology: 'Factory address on BSC (0xCe8fd65646F2a2a897755A1188C04aCe94D2B8D0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    bsc: { factory: '0xCe8fd65646F2a2a897755A1188C04aCe94D2B8D0', staking: ["0x7B2dAC429DF0b39390cD3D4E6a8b8bcCeB331E2D", "0xacc234978a5eb941665fd051ca48765610d82584"] },
  },
  'burgerswap': {
    methodology: 'TVL is equal to AMMs liquidity plus the Assets deposited on Burger Shack',
    bsc: { factory: '0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256', staking: ["0x9154c2684aeF8d106babcB19Aa81d4FabF7581ec", "0xae9269f27437f0fcbc232d39ec814844a51d6b8f"] },
  },
  'cafeswap': {
    bsc: { factory: '0x3e708fdbe3ada63fc94f8f61811196f1302137ad', staking: ["0xc772955c33088a97d56d0bbf473d05267bc4febb", "0x790be81c3ca0e53974be2688cdb954732c9862e1"] },
    polygon: { factory: '0x5ede3f4e7203bf1f12d57af1810448e5db20f46c', staking: ["0xca2DeAc853225f5a4dfC809Ae0B7c6e39104fCe5", "0xb5106A3277718eCaD2F20aB6b86Ce0Fee7A21F09", "polygon", "bsc:0x790be81c3ca0e53974be2688cdb954732c9862e1"] },
  },
  'canary': {
    avax: { factory: '0xCFBA329d49C24b70F3a8b9CC0853493d4645436b', staking: ["0x39124Af473501Ccd83a5791eA1eFBc2e6dd78f10", "0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf"] },
    scroll: '0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf',
  },
  'candycity': {
    methodology: 'Factory address (0x84343b84EEd78228CCFB65EAdEe7659F246023bf) is used to find the LP pairs. TVL is equal to the liquidity on the AMM and the candy tokens in the staking pools / vault / vesting contract / lock contract.',
    cronos: { factory: '0x84343b84EEd78228CCFB65EAdEe7659F246023bf', staking: [["0xDAf7c0e2882818b46c36AdBCe95399821Eca08F8","0x8FEf43b1f3046F8f58A76c64aD01Bc8d82ff0ad1","0xA46C4a3428a5E9B5C84A4457215D98BC8DC17AbB","0xCa207941946218126BD7BBe44C5d457753490b4A","0x7CeA583ea310b3A8a72Ed42B3364aff16d24B3A2","0xE56C1A8D4E90d82BA06F3f49efEc69f736a32070","0xc568Ce4C714c5Ec819eA8F52596a6Fd9523A2B81"], "0x06C04B0AD236e7Ca3B3189b1d049FE80109C7977"], vesting: ["0x427f1230A547566a51F5Ffd5698BB65c06acA2D2", "0x06C04B0AD236e7Ca3B3189b1d049FE80109C7977"] },
  },
  'casinocronos': {
    methodology: 'Factory address (0x570aA1E0aa3d679Bc9DaAA47564ed3Daba1208FE) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CASINO tokens found in the Masterchef(0x81b5118bF8A720B19FEC6F3078d2b555790cb0AB).',
    cronos: { factory: '0x570aA1E0aa3d679Bc9DaAA47564ed3Daba1208FE', staking: ["0x81b5118bF8A720B19FEC6F3078d2b555790cb0AB", "0x95ac4a86c0677971c4125ACe494e3C17a87a4C61"] },
  },
  'champagne-swap': {
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://champagne.finance/ as the source. Staking accounts for the CHAM locked in MasterChef (0x15C17442eb2Cd3a56139e877ec7784b2dbD97270)',
    bsc: { factory: '0xb31A337f1C3ee7fA2b2B83c6F8ee0CA643D807a0', staking: ["0x15C17442eb2Cd3a56139e877ec7784b2dbD97270", "0x4957c1c073557BFf33C01A7cA1436D0d2409d439"] },
  },
  'claimswap': {
    methodology: 'Tvl counts the tokens locked on AMM pools and staking counts the CLA that has been staked',
    klaytn: { factory: '0x3679c3766E70133Ee4A7eb76031E49d3d1f2B50c', staking: ["0x5f5dec0d6402408ee81f52ab985a9c665b6e6010", "0xcf87f94fd8f6b6f0b479771f10df672f99eada63"] },
  },
  'cleopatra-exchange-v1': {
    _options: { hasStablePools: true, stablePoolSymbol: 'crAMM' },
    mantle: { factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', staking: ["0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F", "0xC1E0C8C30F251A07a894609616580ad2CEb547F2"] },
  },
  'cowswap-cash': {
    methodology: 'The CryptoSwap subgraph and the CryptoSwap factory contract address are used to obtain the balance held in every LP pair.',
    smartbch: '0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117',
  },
  'cronaswap': {
    methodology: 'Factory address (0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CRONA tokens found in the Masterchef(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254).',
    _options: {
      blacklistedTokens: ['0x5b5fe1238aca91c65683acd7f9d9bf922e271eaa'],
    },
    cronos: { factory: '0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11', staking: ["0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254", "0xadbd1231fb360047525BEdF962581F3eee7b49fe"] },
  },
  'cryptoswap': {
    methodology: 'The CryptoSwap subgraph and the CryptoSwap factory contract address are used to obtain the balance held in every LP pair.',
    start: '2022-05-02',
    bsc: '0x4136A450861f5CFE7E860Ce93e678Ad12158695C',
  },
  'crystalvale': {
    methodology: 'Factory address (0x794C07912474351b3134E6D6B3B7b3b4A07cbAAa) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    dfk: { factory: '0x794C07912474351b3134E6D6B3B7b3b4A07cbAAa', staking: ["0x6E7185872BCDf3F7a6cBbE81356e50DAFFB002d2", "0x04b9dA42306B023f3572e106B11D82aAd9D32EBb", "dfk", "defi-kingdoms-crystal", 18] },
  },
  'currentx': {
    _options: { coreAssets: ['0x4200000000000000000000000000000000000006'] },
    megaeth: '0xC60940F182F7699522970517f6d753A560546937',
  },
  'dddx': {
    bsc: { factory: '0xb5737A06c330c22056C77a4205D16fFD1436c81b', staking: [["0x488f0252B4bEa5A851FE9C827894d08868D552C0","0xAd8Ab2C2270Ab0603CFC674d28fd545495369f31","0x37056DbB4352877C94Ef6bDbB8C314f749258fCA"], "0x4B6ee8188d6Df169E1071a7c96929640D61f144f"] },
  },
  'dogmoney': {
    dogechain: { factory: '0xaF85e6eD0Da6f7F5F86F2f5A7d595B1b0F35706C', staking: { owner: '0xC5c70fA7A518bE9229eB0Dc84e70a91683694562', tokens: ['0x93C8a00416dD8AB9701fa15CA120160172039851'], lps: ['0x9ab710cd0bfbee60e14115d19c76213c4d4b1687'], useDefaultCoreAssets: true } },
  },
  'equilibre': {
    _options: { hasStablePools: true },
    kava: { factory: '0xA138FAFc30f6Ec6980aAd22656F2F11C38B56a95', staking: ["0x35361C9c2a324F5FB8f3aed2d7bA91CE1410893A", "0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73"] },
  },
  'etcmc': {
    methodology: 'Factory address (0x164999e9174686b39987dfB7E0FAb28465b867A5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    ethereumclassic: { factory: '0x164999e9174686b39987dfB7E0FAb28465b867A5', staking: { tokensAndOwners: [['0x6c3B413C461c42a88160Ed1B1B31d6f7b02a1C83', '0xca1F5a20E07610d82e28683519c72f6817A3505a']], lps: ['0x730F59a8690b50724914D7b9b2f49a8dD18F5572'], useDefaultCoreAssets: true } },
  },
  'etherex-legacy': {
    _options: { hasStablePools: true, stablePoolSymbol: 'cAMM' },
    linea: '0xC0b920f6f1d6122B8187c031554dc8194F644592',
  },
  'ezkalibur': {
    start: '2023-06-09',
    era: { factory: '0x15C664A62086c06D43E75BB3fddED93008B8cE63', staking: ["0x11ef47783740B3F0c9736D54BE8eF8953C3Ead99", "0x240f765Af2273B0CAb6cAff2880D6d8F8B285fa4", "0xc8b6b3a4d2d8428ef3a940eac1e32a7ddadcb0f1", "weth"] },
  },
  'fatex': {
    polygon: { factory: '0x937e0c67d21Df99eaEa0e6a1055A5b783291DC8f', staking: ["0x56BE76031A4614370fA1f188e01e18a1CF16E642", "0x4853365bC81f8270D902076892e13F27c27e7266", "0x69c894Dce6FA2E3b89D3111d29167F0484AC0b2A"] },
  },
  'galoswap': {
    methodology: 'Counts liquidity in pools',
    _options: { hasStablePools: true },
    era: '0x48E571C645bbeD451b7C58650E643F534fCaB693',
  },
  'gemkeeper': {
    oasis: { factory: '0xa7200334f652425A12BF2f7e4F0F5409CCA4d963', staking: ["0x25070fA2244b41EA39B964DBFA9E0ab70A886e72", "0x72Ad551af3c884d02e864B182aD9A34EE414C36C", "0xb29553faf847ba5b79b6ae13fa82d0b216faf626"] },
  },
  'gibxswap': {
    methodology: 'Factory address on BSC (0x97bCD9BB482144291D77ee53bFa99317A82066E8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    bsc: { factory: '0x97bCD9BB482144291D77ee53bFa99317A82066E8', staking: ["0xC31A355277228C1bf9A88599647faEaaE664Ea1f", "0xAe28714390e95B8dF1Ef847C58AEaC23ED457702"] },
  },
  'glacier-finance': {
    _options: { hasStablePools: true },
    avax: { factory: '0xaC7B7EaC8310170109301034b8FdB75eCa4CC491', staking: ["0xed1eE3f892fe8a13A9BE02F92E8FB7410AA84739", "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6"] },
  },
  'glide-finance': {
    methodology: 'Factory address (0xaAbe38153b25f0d4b2bDa620f67059B3a45334e5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    elastos: { factory: '0xaAbe38153b25f0d4b2bDa620f67059B3a45334e5', staking: ["0x7F5489f77Bb8515DE4e0582B60Eb63A7D9959821", "0xd39eC832FF1CaaFAb2729c76dDeac967ABcA8F27", "0xbeeAAb15628329C2C89Bc9F403d34b31fbCb3085", "elastos"] },
  },
  'groveswap': {
    bsc: { factory: '0x0ed713989f421ff6f702b2e4e1c93b1bb9002119', staking: ["0x9db65123aa185811e50f8b626a7d4799c39ea4d5", "0xf33893de6eb6ae9a67442e066ae9abd228f5290c", "0xe27f915a8a9ca6c31b193311ae76b8738b926d17"] },
    ethereum: '0x6c565c5bbdc7f023cae8a2495105a531caac6e54',
    grove: '0x401e7e28e0C679E1a3242ac6CD93C9c56208A260',
  },
  'hermes': {
    methodology: 'We calculate liquidity on all pairs with data retreived from the "hermes-defi/hermes-graph" subgraph plus the total amount in dollars of our staking pools xHermes and sHermes.',
    harmony: { factory: '0xfe5e54a8e28534fffe89b9cfddfd18d3a90b42ca', staking: { owners: ['0x28a4e128f823b1b3168f82f64ea768569a25a37f', '0x8812420fb6e5d971c969ccef2275210ab8d014f0'], tokens: ['0xba4476a302f5bc1dc4053cf79106dc43455904a3'], useDefaultCoreAssets: true, lps: ['0x8604197eb7123888b551fe78a8828b895608d093'] } },
  },
  'honkswap': {
    methodology: 'Factory address (0x34D7ffF45108De08Ca9744aCdf2e8C50AAC1C73C) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    smartbch: '0x34D7ffF45108De08Ca9744aCdf2e8C50AAC1C73C',
  },
  'huckleberry': {
    methodology: 'Liquidity on DEX and supplied and borrowed amounts found using the comptroller address(0xcffef313b69d83cb9ba35d9c0f882b027b846ddc)',
    moonriver: { factory: '0x017603C8f29F7f6394737628a93c57ffBA1b7256', staking: { owner: '0x37619cC85325aFea778830e184CB60a3ABc9210B', tokens: ['0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756'], lps: ['0xbBe2f34367972Cb37ae8dea849aE168834440685'], useDefaultCoreAssets: true } },
    clv: { tvl: () => ({}) },
  },
  'ifswap': {
    methodology: 'We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through MasterChef Contract.',
    csc: '0x44b7864D360BFf7879402E3B860aF47e6e371208',
  },
  'illuminex': {
    methodology: 'Counts liquidity on illumineX Exchange, as well as IX token single staking together with liquidity mining locked LP',
    start: '2024-01-28',
    sapphire: { factory: '0x045551B6A4066db850A1160B8bB7bD9Ce3A2B5A5', staking: ["0x494847e173D6CE28b6eF7a5596df6Bc7830175e1", "0x08Fe02Da45720f754e6FCA338eC1286e860d2d2f", "0xf0f7c4e8edb9edcbe200a4eaec384e8a48fc7815", "oasis-network", true] },
  },
  'kaoyaswap': {
    bsc: { factory: '0xbFB0A989e12D49A0a3874770B1C1CdDF0d9162aA', staking: ["0x21F17c2eC5741c1bEb76d50F08171138A6BA97bf", "0xa8a33e365D5a03c94C3258A10Dd5d6dfE686941B"] },
  },
  'keller': {
    methodology: 'TVL shows the sum of tokens deposited in our pools and Staking shows the number of $KELL locked in the Voting Escrow contract.',
    _options: { hasStablePools: true },
    scroll: { factory: '0xbc83f7dF70aE8A3e4192e1916d9D0F5C2ee86367', staking: ["0x3aC0Bd8433bFC451BB1E1E90CcEF697750512CA2", "0xCF4706120623c527e32493057A4DC0cae5FC8201"] },
  },
  'kryptodex': {
    methodology: 'Factory address (0x33c04bD4Ae93336BbD1024D709f4A313cC858EBe) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    cronos: { factory: '0x33c04bD4Ae93336BbD1024D709f4A313cC858EBe', staking: ["0x53cE820Ed109D67746a86b55713E30252275c127", "0xF0681BB7088Ac68A62909929554Aa22ad89a21fB", "0xD2219106310E46D7FD308c0eC9d9FCc2d2c8a9B5", "crypto-com-chain"] },
  },
  'kyotoswap': {
    methodology: 'Uses factory(0x1c3E50DBBCd05831c3A695d45D2b5bCD691AD8D8) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    bsc: { factory: '0x1c3E50DBBCd05831c3A695d45D2b5bCD691AD8D8', staking: [["0xd8e86cfD71A19AcF79B60fB75F0470185C95B06b"], "0x29ABc4D03D133D8Fd1F1C54318428353CE08727E"] },
  },
  'leetswap': {
    polygon_zkevm: '0xcE87E0960f4e2702f4bFFE277655E993Ae720e84',
    canto: '0x116e8a41E8B0A5A87058AF110C0Ddd55a0ed82B7',
    linea: '0x4DDf0fa98B5f9Bd7Cb0645c25bA89A574fe9Be8c',
    shibarium: '0xd3Ea3BC1F5A3F881bD6cE9761cbA5A0833a5d737',
    op_bnb: '0xa2899c776baaf9925d432f83c950d5054a6cf59c',
    base: { factory: '0x169C06b4cfB09bFD73A81e6f2Bb1eB514D75bB19', hasStablePools: true, stablePoolSymbol: 'sLS2' },
    manta: '0xa2899c776baaf9925d432f83c950d5054a6cf59c',
    scroll: '0xa2899c776baaf9925d432f83c950d5054a6cf59c',
  },
  'leonicornswap': {
    bsc: { factory: '0xEB10f4Fe2A57383215646b4aC0Da70F8EDc69D4F', staking: ["0x72F8fE2489A4d480957d5dF9924166e7a8DDaBBf", ["0x2c8368f8F474Ed9aF49b87eAc77061BEb986c2f1","0x27E873bee690C8E161813DE3566E9E18a64b0381"]] },
  },
  'lfgswap-core': {
    core: '0xA1ADD165AED06D26fC1110b153ae17a5A5ae389e',
  },
  'merchant-moe': {
    mantle: '0x5bef015ca9424a7c07b68490616a4c1f094bedec',
  },
  'mindgames': {
    methodology: 'Factory address (0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    arbitrum: { factory: '0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0', staking: { owner: '0x35AfE95662fdf442762a11E4eD5172C81fBceF7e', tokens: ['0xb21Be1Caf592A5DC1e75e418704d1B6d50B0d083'], coreAssets: ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'], lps: ['0xf7305D209BFeCF40Bd53ccBdbe5303B3153d0660'] } },
  },
  'mistswap': {
    methodology: 'Factory address (0x6008247F53395E7be698249770aa1D2bfE265Ca0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    smartbch: { factory: '0x6008247F53395E7be698249770aa1D2bfE265Ca0', staking: ["0xC41C680c60309d4646379eD62020c534eB67b6f4", "0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129", "smartbch", "mistswap", 18] },
  },
  'mm-finance': {
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://mm.finance as the source. Staking accounts for the MMF locked in MasterChef (0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc)',
    _options: {
      blacklistedTokens: [
        '0xd8d40dcee0c2b486eebd1fedb3f507b011de7ff0',
        '0xa60943a1B19395C999ce6c21527b6B278F3f2046',
        '0x388c07066aa6cea2be4db58e702333df92c3a074',
      ],
    },
    cronos: { factory: '0xd590cC180601AEcD6eeADD9B7f2B7611519544f4', staking: ["0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc", "0x97749c9B61F878a880DfE312d2594AE07AEd7656"] },
  },
  'mm-finance-arbitrum': {
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://arbimm.finance as the source. Staking accounts for the MMF locked in MasterChef (0xa73Ae666CEB460D5E884a20fb30DE2909604557A)',
    arbitrum: { factory: '0xfe3699303D3Eb460638e8aDA2bf1cFd092C33F22', staking: ["0xa73Ae666CEB460D5E884a20fb30DE2909604557A", "0x56b251d4b493ee3956e3f899d36b7290902d2326"] },
  },
  'mm-finance-polygon': {
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://polymm.finance as the source. Staking accounts for the MMF locked in MasterChef (0xa2B417088D63400d211A4D5EB3C4C5363f834764)',
    polygon: { factory: '0x7cFB780010e9C861e03bCbC7AC12E013137D47A5', staking: ["0xa2B417088D63400d211A4D5EB3C4C5363f834764", "0x22a31bD4cB694433B6de19e0aCC2899E553e9481"] },
  },
  'mochiswap': {
    bsc: { factory: '0xCBac17919f7aad11E623Af4FeA98B10B84802eAc', staking: ["0x464F1A30e5A5b5b2D3c5f4F0e823e01EeFE304df", "0x2d0e75b683e8b56243b429b24f2b08bcc1ffd8da"] },
    harmony: { factory: '0x3bEF610a4A6736Fd00EBf9A73DA5535B413d82F6', staking: ["0xd0cb3e55449646c9735d53e83eea5eb7e97a52dc", "0x691f37653f2fbed9063febb1a7f54bc5c40bed8c"], hallmarks: [['2022-06-23', 'Horizon bridge Hack $100m']] },
  },
  'moonbase': {
    methodology: 'Uses factory(0x44B678F32a2f6aBB72eeFA2df58f12D17c3eD403) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    arbitrum: '0x44B678F32a2f6aBB72eeFA2df58f12D17c3eD403',
    base: { factory: '0xe396465A85deDB00FA8774162B106833dE51Ea41', useDefaultCoreAssets: false },
  },
  'moonchainswap': {
    mxczkevm: '0x8bC7cf83f5F83781Ec85B78d866222987Ae24657',
  },
  'moraswap': {
    _options: { queryBatched: 10, waitBetweenCalls: 1000 },
    neon_evm: { factory: '0xd43F135f6667174f695ecB7DD2B5f953d161e4d1', staking: ["0xa3da566fdE97c90c08052f612BdBed8F3B8004B7", "0x2043191e10a2A4b4601F5123D6C94E000b5d915F", "0xe6faaf048b2A9b9Bf906aBdD8623811458d81Cf3"] },
  },
  'mute': {
    methodology: 'Counts liquidity in pools and KOI token in the veKOI contract',
    _options: { hasStablePools: true, stablePoolSymbol: 'sMLP' },
    era: { factory: '0x40be1cba6c5b47cdf9da7f963b6f761f4c60627d', staking: [["0x98dB4e3Df6502369dAD7AC99f3aEE5D064721C4C"], ["0xa995ad25ce5eb76972ab356168f5e1d9257e4d05"]] },
  },
  'neuronswap': {
    timetravel: false,
    methodology: "Tvl counts the tokens locked on AMM pools and staking counts the NR that has been staked. Data is pulled from the 'https://core.neuronswap.com/api/dashboard'",
    klaytn: { factory: '0xe334e8c7073e9aaae3cab998eecca33f56df6621', staking: { tokens: ['0x340073962a8561cb9e0c271aab7e182d5f5af5c8'], owner: '0x92a47a5c6b742b2056f0f4afb7724112c83715e1', lps: ['0x908a4E95b447bD2e0fd7c020618Ab84b5d6FFc87'], useDefaultCoreAssets: true } },
  },
  'newswap': {
    new: '0x723913136a42684B5e3657e3cD2f67ee3e83A82D',
  },
  'nile-exchange-v1': {
    _options: { hasStablePools: true, stablePoolSymbol: 'cAMM' },
    linea: { factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', staking: ["0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F", "0xAAAac83751090C6ea42379626435f805DDF54DC8"] },
  },
  'nuri-exchange-v1': {
    _options: { hasStablePools: true, stablePoolSymbol: 'crAMM' },
    scroll: { factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', staking: ["0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F", "0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769"] },
  },
  'omniswap': {
    methodology: 'TVL consists of liquidity pools created through the factory contract',
    nibiru: '0x2043d6f72CcD82c4Eae36fF331ADAE8C77bA5897',
  },
  'oni': {
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://info.oni.exchange/ as the source. Staking accounts for ONI locked in MasterChef (0xE93fC7e6103EF86F3329635B8197D462B74F0cb8)',
    bsc: { factory: '0xED13950fD0a2E10788E830e60CFA0D018125310e', staking: ["0xE93fC7e6103EF86F3329635B8197D462B74F0cb8", "0x6c77BB19C69d66bEA9E3CDAea108A76eA8D2Fd2A", "0x7A070189A28875aC936F517A9d452248619F0CA6"] },
  },
  'openxswap': {
    optimism: { factory: '0xf3C7978Ddd70B4158b53e897f980093183cA5c52', staking: ["0x2513486f18eeE1498D7b6281f668B955181Dd0D9", "0xc3864f98f2a61A7cAeb95b039D031b4E2f55e0e9"] },
  },
  'oracleswap': {
    methodology: 'Factory address (0xDcA8EfcDe7F6Cb36904ea204bb7FCC724889b55d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    songbird: { factory: '0xDcA8EfcDe7F6Cb36904ea204bb7FCC724889b55d', staking: ["0x5795377c85e0fdF6370fae1B74Fe03b930C4a892", "0xd7565b16b65376e2ddb6c71e7971c7185a7ff3ff", "0x1987E504E70b9ACbAa4E042FDDE4ecB6CEaf5b77", "songbird"] },
  },
  'orbitalswap': {
    methodology: 'Uses factory(0x1A04Afe9778f95829017741bF46C9524B91433fB) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    bsc: { factory: '0x1A04Afe9778f95829017741bF46C9524B91433fB', staking: ["0xd67a0CE4B1484DBa8dB53349F9b26a3272dB04F5", "0x42b98A2f73a282D731b0B8F4ACfB6cAF3565496B"] },
  },
  'paintswap': {
    fantom: { factory: '0x733A9D1585f2d14c77b49d39BC7d7dd14CdA4aa5', staking: [["0xCb80F529724B9620145230A0C866AC2FACBE4e3D","0x9076C96e01F6F13e1eC4832354dF970d245e124F"], "0x85dec8c4b2680793661bca91a8f129607571863d"] },
  },
  'partyswap': {
    avax: { factory: '0x58a08bc28f3e8dab8fb2773d8f243bc740398b09', staking: ["0xA07d1932775f22DaeDA671812c16F859b4257363", "0x25afd99fcb474d7c336a2971f26966da652a92bc", "0x379842a6cd96a70ebce66004275ce0c68069df62", "avalanche-2"] },
  },
  'pharaoh-exchange-v1': {
    _options: { hasStablePools: true, stablePoolSymbol: 'crAMM' },
    avax: { factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', staking: ["0xAAA3249511DE3E7A5c61FbA8313170c1Bef9A65e", "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b"] },
  },
  'pharaoh-exchange-v3-legacy': {
    _options: { hasStablePools: true, stablePoolSymbol: 'Stable' },
    avax: '0x85448bF2F589ab1F56225DF5167c63f57758f8c1',
  },
  'pinkswap': {
    bsc: { factory: '0x7D2Ce25C28334E40f37b2A068ec8d5a59F11Ea54', staking: ["0xe981676633dCf0256Aa512f4923A7e8DA180C595", "0x702b3f41772e321aacCdea91e1FCEF682D21125D"] },
  },
  'polycat-dex': {
    methodology: 'TVL are from the pools created by the factory and TVL in vaults',
    polygon: { factory: '0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA', staking: ["0xfaBC099AD582072d26375F65d659A3792D1740fB", "0xbc5b59ea1b6f8da8258615ee38d40e999ec5d74f"] },
  },
  'ponder': {
    methodology: 'TVL includes the liquidity in all Ponder trading pairs on Bitkub Chain. Staking counts PONDER tokens locked in the staking contract.',
    start: 1704067200,
    _options: { fetchBalances: true },
    bitkub: { factory: '0x20b17e92dd1866ec647acaa38fe1f7075e4b359e', staking: ["0x6c8119d33fd43f6b254d041cd5d2675586731dd5", "0xe0432224871917fb5a137f4a153a51ecf9f74f57", "bitkub", "ethereum:0xe0432224871917fb5a137f4a153a51ecf9f74f57"] },
  },
  'quantoswap': {
    ethereum: { factory: '0xe185e5335d68c2a18564b4b43bdf4ed86337ee70', staking: [["0xc7e40abf6a1f6a6f79b64d86ca1960816271caca"], "0x37A2f8701856a78DE92DBe35dF2200c355EAe090"] },
  },
  'ramses': {
    _options: { hasStablePools: true, stablePoolSymbol: 'crAMM' },
    arbitrum: { factory: '0xAAA20D08e59F6561f242b08513D36266C5A29415', staking: ["0xAAA343032aA79eE9a6897Dab03bef967c3289a06", "0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418"] },
    hyperliquid: '0xd0a07E160511c40ccD5340e94660E9C9c01b0D27',
  },
  'ramses-hl-legacy': {
    _options: { hasStablePools: true, stablePoolSymbol: 'cAMM' },
    hyperliquid: '0xd0a07E160511c40ccD5340e94660E9C9c01b0D27',
  },
  'sharkyswap': {
    arbitrum: { factory: '0x36800286f652dDC9bDcFfEDc4e71FDd207C1d07C', staking: ["0xD5f406eB9E38E3B3E35072A8A35E0DcC671ea8DB", "0x73eD68B834e44096eB4beA6eDeAD038c945722F1"] },
  },
  'shibance': {
    methodology: 'We count liquidity on the dexes, pulling data from subgraphs',
    kcc: '0x1aDb92364888C9A65e65C287DaE48032681327c8',
    bsc: '0x092EE062Baa0440B6df6BBb7Db7e66D8902bFdF7',
  },
  'smartdexbch': {
    methodology: 'Count TVL as liquidity on the dex',
    smartbch: { factory: '0xDd749813a4561100bDD3F50079a07110d148EaF5', staking: ["0x46269c22848738573761eC50a736916272857f83", "0x47c259DFe165Cef3e429C9B66bf9ce9dc3e68aC2", "0xce6c8D26d370C18618DEE42a18190624105B212F", "bitcoin-cash", false, 18] },
  },
  'smbswap': {
    methodology: 'The SMBswap subgraph and the SMBswap factory contract address are used to obtain the balance held in every LP pair.',
    start: '2022-02-19',
    bsc: '0x2Af5c23798FEc8E433E11cce4A8822d95cD90565',
  },
  'smolswap': {
    methodology: 'Factory address (0x7Aa2149fF9EF4A09D4ace72C49C26AaE8C89Fb48) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of SMOL tokens found in the Masterchef(0x66a5f06d9c8bdc27bb0768eeff71d22b468fb464).',
    cronos: { factory: '0x7Aa2149fF9EF4A09D4ace72C49C26AaE8C89Fb48', staking: ["0x66a5f06d9c8bdc27bb0768eeff71d22b468fb464", "0x2Ad63Da83d6ff5dA9E716DcaE844D4f157405BDd", "0x408b982fDC78eA8fdF8f8652C7893181A645d782", "crypto-com-chain", true] },
  },
  'solisnek': {
    _options: { hasStablePools: true, stablePoolSymbol: 'ssAMM' },
    avax: '0xeeee1F1c93836B2CAf8B9E929cb978c35d46657E',
  },
  'soyfinance': {
    methodology: 'Factory address (0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    callisto: { factory: '0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5', blacklistedTokens: ['0x9fae2529863bd691b4a7171bdfcf33c7ebb10a65'] },
    ethereumclassic: '0x23675f1Ac7cce101Aff647B96d7201EfCf66E4b0',
    bittorrent: '0xbf6c50889d3a620eb42c0f188b65ade90de958c4',
    bsc: '0x23675f1Ac7cce101Aff647B96d7201EfCf66E4b0',
  },
  'starswap': {
    methodology: 'StarSwap TVL Calculation',
    astar: { factory: '0x0b657e81a0C3E903cbe1228579fBd49AC5D81Ac1', staking: ["0x0262592d5f489e19afe070abc88a0808afc75250", "0x8489f4554790F5A103F2B0398537eAEe68B73884"] },
  },
  'swapfish': {
    methodology: 'Uses factory(0x71539D09D3890195dDa87A6198B98B75211b72F3) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    arbitrum: { factory: '0x71539D09D3890195dDa87A6198B98B75211b72F3', staking: ["0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029", "0xb348B87b23D5977E2948E6f36ca07E1EC94d7328"] },
    bsc: { factory: '0x71539D09D3890195dDa87A6198B98B75211b72F3', staking: ["0x671eFBa3F6874485cC39535fa7b525fe764985e9", "0xb348B87b23D5977E2948E6f36ca07E1EC94d7328"] },
  },
  'swaprum': {
    arbitrum: { factory: '0xD757C986a28F82761Fe874Bc40073718dC1e980C', staking: [["0x2B6deC18E8e4DEf679b2E52e628B14751F2f66bc"], "0x2aE25460c44d578E6f41aB900a7A5425b6492C16"] },
  },
  'tangoswap': {
    methodology: 'Count TVL as liquidity on the dex',
    smartbch: { factory: '0x2F3f70d13223EDDCA9593fAC9fc010e912DF917a', staking: ["0x98Ff640323C059d8C4CB846976973FEEB0E068aA", "0x73BE9c8Edf5e951c9a0762EA2b1DE8c8F38B5e91", "smartbch", "tangoswap", 18] },
  },
  'tendieswap': {
    methodology: 'TVL counts the liquidity in each of the Tendieswap pairs. Pairs are found using the factory address. Staking TVL accounts for TENDIE on its masterchef contract.',
    bsc: { factory: '0xb5b4aE9413dFD4d1489350dCA09B1aE6B76BD3a8', staking: ["0x6dDb25ca46656767f8f2385D653992dC1cdb4470", "0x9853A30C69474BeD37595F9B149ad634b5c323d9"] },
  },
  'tendieswap-app': {
    tenet: '0x2D2ee1a4aec9f3c8c14dFcE837e1C89b639dd1E4',
  },
  'tethys': {
    methodology: 'Metis tokens, USDC, USDT, WETH, TETHYS allocated in LP',
    metis: { factory: '0x2CdFB20205701FF01689461610C9F321D1d00F80', staking: ["0x54A8fB8c634dED694D270b78Cb931cA6bF241E21", "0x69fdb77064ec5c84FA2F21072973eB28441F43F3"] },
  },
  'tulip': {
    oasis: { factory: '0x90a5e676EFBdeFeeeb015cd87484B712fd54C96A', staking: ["0xceF2f95f185D49bcd1c10DE7f23BEaCBaae6eD0f", "0x2736643C7fFFe186984f60a2d34b91b1b7398bF1"] },
  },
  'ultronSwap': {
    ultron: { factory: '0xe1F0D4a5123Fd0834Be805d84520DFDCd8CF00b7', staking: { owner: '0xf26E50c26Ed51AbeC4078380Ed1F13440011F2A1', tokens: ['0x3a4f06431457de873b588846d139ec0d86275d54'] } },
  },
  'unifi-protocol': {
    timetravel: false,
    avax: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
    bsc: '0xA5Ba037Ec16c45f8ae09e013C1849554C01385f5',
    iotex: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
    ontology_evm: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
    ethereum: { factory: '0x08e7974CacF66C5a92a37c221A15D3c30C7d97e0', staking: ['0x2e2fb3db9ecdb9b7d9eb05e00964c8941f7171a7', '0x441761326490cACF7aF299725B6292597EE822c2'] },
    fantom: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
    harmony: '0x7aB6ef0cE51a2aDc5B673Bad7218C01AE9B04695',
    polygon: '0x4FEE52912f81B78C3CdcB723728926ED6a893D27',
    bittorrent: '0xCAaB36C77841647dC9955B3b1D03710E9B9F127f',
    tron: 'TUtmsH4DZewoihrybFU2RG1pdW9sBhuSRZ',
  },
  'vanswap': {
    vision: { factory: '0xF6D67482DEDE4D208F74CCD0E6592764014F546F', staking: ["0x1b7BCea38FA123236CfF7D0F944e01F501842123", "0xa3cFA732c835233db3d6bf5f4A3c2D45b02Eb6B9", "0x1e0583bc7D49b693277Cc7E0F6af1A0bdB56e9D8", "tether"] },
  },
  'venera': {
    bsc: '0x95F9c44fA1585811e1D1a0F59e74174B657B37A5',
  },
  'versedex': {
    methodology: 'Factory address (0x16bc2B187D7C7255b647830C05a6283f2B9A3AF8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    ethereum: '0xee3E9E46E34a27dC755a63e2849C9913Ee1A06E2',
    smartbch: '0x16bc2B187D7C7255b647830C05a6283f2B9A3AF8',
  },
  'w3swap': {
    methodology: "Counts the tokens locked on AMM pools. Data is getting from the 'satoshirock/w3infov2' subgraph.",
    bsc: '0xD04A80baeeF12fD7b1D1ee6b1f8ad354f81bc4d7',
    pg: { tvl: () => ({}) },
  },
  'wannaswap': {
    aurora: { factory: '0x7928D4FeA7b2c90C732c10aFF59cf403f0C38246', staking: ["0x5205c30bf2E37494F8cF77D2c19C6BA4d2778B9B", "0x7faA64Faf54750a2E3eE621166635fEAF406Ab22"] },
  },
  'wardenswap': {
    methodology: "TVL is calculated from total liquidity of WardenSwap's active pools listed on our farm page https://farm.wardenswap.finance/?t=1&s=1/#/farm, excluding pools at PancakeSwap and inactive pools are not included, plus total warden staked in Warden pool",
    hallmarks: [
      ['2021-08-25', "Announcement 2 week left before pool's rewards end"],
      ['2021-08-27', "Start pool's reward 100x warden pool"],
      ['2021-09-10', "Pool's rewards end"],
    ],
    bsc: { factory: '0x3657952d7bA5A0A4799809b5B6fdfF9ec5B46293', staking: ["0xde866dD77b6DF6772e320dC92BFF0eDDC626C674", "0x0fEAdcC3824E7F3c12f40E324a60c23cA51627fc"] },
  },
  'warpx': {
    _options: { fetchBalances: true, coreAssets: ['0x4200000000000000000000000000000000000006'] },
    megaeth: '0xB3Ae00A68F09E8b8a003B7669e2E84544cC4a385',
  },
  'whaleswap': {
    bsc: { factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121', staking: { owners: ['0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D', '0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7'], tokens: ['0xdded222297b3d08dafdac8f65eeb799b2674c78f'], useDefaultCoreAssets: true, lps: ['0x85aa60b3e25a7df37ea1ec1f38ef403d536f0489'] } },
    fantom: { factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121', staking: { owners: ['0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D', '0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7'], tokens: ['0xdded222297b3d08dafdac8f65eeb799b2674c78f'], useDefaultCoreAssets: true, lps: ['0x48eD248c981d6a97Ba84e21Dd02685951423f59B'] } },
    arbitrum: { factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121', staking: { owners: ['0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D', '0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7'], tokens: ['0xdded222297b3d08dafdac8f65eeb799b2674c78f'], useDefaultCoreAssets: true, lps: ['0x70348dAEB1cC0DD873481690823552590b71873A'] } },
    optimism: { factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121', staking: { owners: ['0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D', '0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7'], tokens: ['0xdded222297b3d08dafdac8f65eeb799b2674c78f'], useDefaultCoreAssets: true, lps: ['0xD6E83C3b484F9bd4755e1AD7Bc1a401f6e63e176'] } },
    avax: { factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121', staking: { owners: ['0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D', '0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7'], tokens: ['0xdded222297b3d08dafdac8f65eeb799b2674c78f'], useDefaultCoreAssets: true, lps: ['0xA81c921479baD1980e6e47267EeE949a987AB29e'] } },
    polygon: { factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121', staking: { owners: ['0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D', '0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7'], tokens: ['0xdded222297b3d08dafdac8f65eeb799b2674c78f'], useDefaultCoreAssets: true, lps: ['0x12B880dBDB3e7f49f30644D78e4119fDA510BDfF'] } },
    kava: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
  },
  'wind-swap-cl': {
    methodology: 'TVL includes liquidity in Slipstream CL pools, staking includes WIND locked in veWIND (VotingEscrow) for voting rewards.',
    sei: {
      factory: '0xA0E081764Ed601074C1B370eb117413145F5e8Cc',
      fetchBalances: true,
      useDefaultCoreAssets: false,
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint) view returns (address)',
      },
      staking: ['0x9312A9702c3F0105246e12874c4A0EdC6aD07593', '0x80B56cF09c18e642DC04d94b8AD25Bb5605c1421'],
    },
  },
  'wingswap': {
    methodology: 'Factory address (0xc0719a9A35a2D9eBBFdf1C6d383a5E8E7b2ef7a8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    fantom: { factory: '0xc0719a9A35a2D9eBBFdf1C6d383a5E8E7b2ef7a8', staking: ["0x546dA2105c52dc2dBA3a4320b43bc2cfDA9cB311", "0xF24be6c063Bee7c7844dD90a21fdf7d783d41a94", "0x194C3973Eb43Ba98941C5e9D8e3D06EF9e6aa399"] },
  },
  'wojakfinance': {
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://wojak.fi/info as the source. Staking accounts for the WOJK locked in MasterChef (0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a)',
    dogechain: { factory: '0xc7c86B4f940Ff1C13c736b697e3FbA5a6Bc979F9', staking: { owners: ['0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a', '0xDF21058099e69D3635005339721C4826c4c47F8A'], tokens: ['0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD'], useDefaultCoreAssets: true, lps: ['0xC1FaBe61B9cFC005a51e1Ea899C3D65fb6392497'] } },
  },
  'wtfdex': {
    methodology: 'Uses factory(0x63FD0a6acBfFB128E7BC7753BFA3B8639A233d50) address and whitelisted tokens address to find and price Liquidity Pool pairs',
    arbitrum: { factory: '0x63FD0a6acBfFB128E7BC7753BFA3B8639A233d50', staking: ["0x8F4Ed4Cf0300E22c739d2E5A22220497B123b66e", "0x4e6482b05D13085f1C4A7e2Ef612ba43104f71b9"] },
  },
  'yieldfields': {
    methodology: 'The YieldFields subgraph and the YieldFields factory contract address are used to obtain the balance held in every LP pair.',
    start: '2021-05-17',
    bsc: '0x0A376eE063184B444ff66a9a22AD91525285FE1C',
  },
  'zenithswap': {
    methodology: 'Factory address (0x8F086a081621bbc13B6d02A9e1123212CF07fdf8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.',
    arbitrum: { factory: '0x8F086a081621bbc13B6d02A9e1123212CF07fdf8', staking: ["0xa3b19C3aFD545900B778Cc7B3e2dC35848672aC2", "0xb2dcbd5258a22385240e4ac13fc6726b66f0de96"] },
  },
  'zk-swap': {
    era: { factory: '0x5da48a338647e2DD79329b557b5729D8496aD83D', staking: ["0x7bA76d4e4cBD4A9B7E3fd9a3B7Db067a51ca9682", "0xAbdb137D013b8B328FA43Fc04a6fA340D1CeA733", "0x8489727b22Dd7eF8BbC91E0E88ee781cb2B27274"] },
  },
  'zkSwap-finance': {
    methodology: 'TVL is total liquidity of all liquidity pools.',
    era: { factory: '0x3a76e377ed58c8731f9df3a36155942438744ce3', staking: [["0x9F9D043fB77A194b4216784Eb5985c471b979D67","0x4Ca2aC3513739ceBF053B66a1d59C88d925f1987","0x056f1960b5CF53676AD9C0A7113363A812DC0c8e"], ["0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A"]] },
    sonic: '0xCe98a0E578b639AA90EE96eD5ba8E5a4022de529',
    monad: '0x0ff16867BcaC3C5fdc2dc73558e3F8e2ed89EEA2',
  },
  'zkevmswap': {
    polygon_zkevm: '0x213c25900f365f1be338df478cd82bef7fd43f85',
  },
}

module.exports = buildProtocolExports(uniV2Configs, uniV2ExportFn)
