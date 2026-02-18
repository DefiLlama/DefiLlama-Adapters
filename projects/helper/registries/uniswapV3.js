const { uniV3Export } = require('../uniswapV3')
const { buildProtocolExports } = require('./utils')

const uniV3Configs = {
  // --- previously consolidated ---
  'blasterswap-v3': { blast: { factory: '0x1A8027625C830aAC43aD82a3f7cD6D5fdCE89d78', fromBlock: 4308657 } },
  'comet-swap-v3': { astar: { factory: '0x2C1EEf5f87F4F3194FdAAfa20aE536b1bA49863b', fromBlock: 12168518 } },
  'warpx-v3': { megaeth: { factory: '0xf67cF9d6FC433e97Ec39Ae4b7E4451B56B171C8a', fromBlock: 4630394 } },
  'sailfish-v3': { occ: { factory: '0x963A7f4eB46967A9fd3dFbabD354fC294FA2BF5C', fromBlock: 142495 } },
  'tradegpt': { '0g': { factory: '0x6F3945Ab27296D1D66D8EEb042ff1B4fb2E0CE70', fromBlock: 5711733 } },
  'ultrasolid-v3': { hyperliquid: { factory: '0xD883a0B7889475d362CEA8fDf588266a3da554A1', fromBlock: 10742640 } },
  'juiceswap': { citrea: { factory: '0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82', fromBlock: 2651539 } },
  'weero-v3': { klaytn: { factory: '0x6603E53b4Ae1AdB1755bAF62BcbF206f90874178', fromBlock: 186673202 } },
  'lynex': {
    linea: {
      factory: '0x622b2c98123D303ae067DB4925CD6282B3A08D0F',
      fromBlock: 143660,
      isAlgebra: true,
      blacklistedTokens: ['0xb79dd08ea68a908a97220c76d19a6aa9cbde4376', '0x1e1f509963a6d33e169d9497b11c7dbfe73b7f13'],
      staking: ['0x8D95f56b0Bac46e8ac1d3A3F12FB1E5BC39b4c0c', '0x1a51b19CE03dbE0Cb44C1528E34a7EDD7771E9Af'], // [stakingContract, LYNX]
    },
  },
  'goblin-dex': {
    smartbch: { factory: '0x08153648C209644a68ED4DC0aC06795F6563D17b', fromBlock: 14169895, staking: ['0xfA3D02c971F6D97076b8405500c2210476C6A5E8', '0x56381cb87c8990971f3e9d948939e1a95ea113a3'] },
    base: { factory: '0xE82Fa4d4Ff25bad8B07c4d1ebd50e83180DD5eB8', fromBlock: 21481309, staking: ['0x866932399DEBdc1694Da094027137Ebb85D97206', '0xcdba3e4c5c505f37cfbbb7accf20d57e793568e3'] },
    bsc: { factory: '0x30D9e1f894FBc7d2227Dd2a017F955d5586b1e14', fromBlock: 42363117, staking: ['0xb4d117f9c404652030f3d12f6de58172317a2eda', '0x701aca29ae0f5d24555f1e8a6cf007541291d110'] },
  },
  'basexfi': {
    methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
    base: { factory: '0xdC323d16C451819890805737997F4Ede96b95e3e', fromBlock: 4159800 },
  },
  'basex': {
    methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
    base: { factory: '0x38015d05f4fec8afe15d7cc0386a126574e8077b', fromBlock: 3152527 },
  },
  'mute-cl': {
    era: { factory: '0x488A92576DA475f7429BC9dec9247045156144D3', fromBlock: 32830523 },
  },
  'solidly-v3': {
    hallmarks: [['2023-09-03', 'Solidly V3 launch']],
    ethereum: { factory: '0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687', fromBlock: 18044650 },
    optimism: { factory: '0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687', fromBlock: 115235065 },
    base: { factory: '0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687', fromBlock: 9672720, permitFailure: true },
    arbitrum: { factory: '0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687', fromBlock: 173576189, permitFailure: true },
    fantom: { factory: '0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687', fromBlock: 73057898, permitFailure: true },
    sonic: { factory: '0x777fAca731b17E8847eBF175c94DbE9d81A8f630', fromBlock: 514659, permitFailure: true },
  },
  'prism-dex': {
    methodology: 'Counts TVL from all Uniswap V3 pools deployed via the factory contract at 0x1adb8f973373505bb206e0e5d87af8fb1f5514ef',
    start: 7845865,
    megaeth: { factory: '0x1adb8f973373505bb206e0e5d87af8fb1f5514ef', fromBlock: 7845865 },
  },
  'superswap-v3': {
    methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
    optimism: { factory: '0xe52a36Bb76e8f40e1117db5Ff14Bd1f7b058B720', fromBlock: 124982239 },
  },
  'summitx-finance': {
    methodology: 'TVL is calculated by summing the token balances in all SummitX V3 pools on Camp Network using the standard Uniswap V3 helper functions for accurate pricing.',
    camp: { factory: '0xBa08235b05d06A8A27822faCF3BaBeF4f972BF7d', fromBlock: 1 },
  },
  'stationdex-v3': {
    deadFrom: '2025-01-01',
    xlayer: { factory: '0xA7c6d971586573CBa1870b9b6A281bb0d5f853bC', fromBlock: 451069 },
  },
  // --- auto-extracted ---
  '9inch-io-v3': {
    pulse: {
      factory: '0xCfd33C867C9F031AadfF7939Cb8086Ee5ae88c41',
      fromBlock: 20357155,
    },
  },
  '9mm-v3': {
    pulse: {
      factory: '0xe50dbdc88e87a2c92984d794bcf3d1d76f619c68',
      fromBlock: 18942139,
    },
    base: {
      factory: '0x7b72C4002EA7c276dd717B96b20f4956c5C904E7',
      fromBlock: 15754625,
    },
    sonic: {
      factory: '0x924aee3929C8A45aC9c41e9e9Cdf3eA761ca75e5',
      fromBlock: 10079213,
    },
  },
  'aethonswap': {
    monad: {
      factory: '0x05aA1d36F78D1242C40b3680d38EB1feE7060c20',
      fromBlock: 31728497,
      isAlgebra: true,
      permitFailure: true,
    },
  },
  'agni-fi': {
    mantle: {
      factory: '0x25780dc8Fc3cfBD75F33bFDAB65e969b603b2035',
      fromBlock: 35714,
    },
  },
  'algebra-v2': {
    avax: {
      factory: '0xa2A92Bb449CCa49b810C84c0efC36a88431655f2',
      fromBlock: 31662680,
      isAlgebra: true,
    },
  },
  'alienbase-v3': {
    base: {
      factory: '0x0Fd83557b2be93617c9C1C1B6fd549401C74558C',
      fromBlock: 7150708,
      permitFailure: true,
    },
  },
  'ammos-fi': {
    mantle: {
      factory: '0x636eA278699A300d3A849aB2cE36c891C4eE3Da0',
      fromBlock: 20634,
    },
  },
  'apertureSwap': {
    manta: {
      factory: '0x5bd1F6735B80e58aAC88B8A94836854d3068a13a',
      fromBlock: 41427,
    },
  },
  'aquadex-v3': {
    water: {
      factory: '0xc8F2534FF7c88EFeacF4Fdb0E81D87c6235C3bEA',
      fromBlock: 1,
    },
  },
  'arbitrumexchange-v3': {
    arbitrum: {
      factory: '0x855f2c70cf5cb1d56c15ed309a4dfefb88ed909e',
      fromBlock: 86863305,
    },
  },
  'arch-fi': {
    btnx: {
      factory: '0x57Fd247Ce7922067710452923806F52F4b1c2D34',
      fromBlock: 674333,
      isAlgebra: true,
    },
  },
  'arthswap-v3': {
    astar: {
      factory: '0x69E92b56e4BF4C0FFa2cFB087c7EA47E846a7244',
      fromBlock: 3957189,
    },
    astrzk: {
      factory: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
      fromBlock: 179999,
    },
  },
  'assetchain-swap': {
    assetchain: {
      factory: '0xa9d53862D01190e78dDAf924a8F497b4F8bb5163',
      fromBlock: 17598,
    },
  },
  'astarexchangev3': {
    astar: {
      factory: '0x0bA242809B5b8AC2C362372807bc616fc620DB97',
      fromBlock: 3333333,
    },
  },
  'atlantis': {
    monad: {
      factory: '0x10253594a832f967994b44f33411940533302acb',
      fromBlock: 35520610,
      isAlgebra: true,
    },
  },
  'Atlantis-algebra': {
    sonic: {
      factory: '0x7C839669a12FAE0BFBE2F6a16516Dd2ADc2F1a1b',
      fromBlock: 33883713,
      isAlgebra: true,
    },
  },
  'atlas-exchange': {
    hemi: {
      factory: '0x841Fc6E05ed09f6540899ABF361CD922006FE238',
      fromBlock: 1291436,
      isAlgebra: true,
    },
  },
  'axion-finance-v3': {
    taiko: {
      factory: '0x0526521166748a61A6fd24effa48FEF98F34b9e4',
      fromBlock: 868506,
    },
  },
  'babydoge-algebra': {
    bsc: {
      factory: '0xda3285630ee68b94e9ba484e11512f586634d593',
      fromBlock: 54100671,
      isAlgebra: true,
    },
  },
  'bagelswap': {
    base: {
      factory: '0xFAa5F5F4a3c6ed4446F7B6014322C954d218690C',
      fromBlock: 2523289,
    },
  },
  'beam-dex': {
    zeta: {
      factory: '0x28b5244B6CA7Cb07f2f7F40edE944c07C2395603',
      fromBlock: 5320498,
      isAlgebra: true,
      permitFailure: true,
    },
  },
  'beamswap-v3': {
    moonbeam: {
      factory: '0xd118fa707147c54387b738f54838ea5dd4196e71',
      fromBlock: 3579833,
    },
  },
  'bitswap-bb-v3': {
    bouncebit: {
      factory: '0x30a326d09E01d7960a0A2639c8F13362e6cd304A',
      fromBlock: 218667,
    },
  },
  'bitzy': {
    btnx: {
      factory: '0xa8C00286d8d37131c1d033dEeE2F754148932800',
      fromBlock: 186643,
      blacklistedOwners: ['0xADC57668ccDaebFb356A49c461A18dB59C122d9B'],
    },
  },
  'bladeswap-CL': {
    blast: {
      factory: '0xA87DbF5082Af26c9A6Ab2B854E378f704638CCa5',
      fromBlock: 4466565,
      isAlgebra: true,
      blacklistedTokens: ['0xD1FedD031b92f50a50c05E2C45aF1aDb4CEa82f4', '0xF8f2ab7C84CDB6CCaF1F699eB54Ba30C36B95d85'],
    },
  },
  'Blaster': {
    blast: {
      factory: '0x9792FaeA53Af241bCE57C7C8D6622d5DaAD0D4Fc',
      fromBlock: 693561,
    },
  },
  'blueprint': {
    ethereum: {
      factory: '0xe777c3da43ec554ec845649323215afaa34d6c23',
      fromBlock: 18692575,
    },
  },
  'bulbaswap-v3': {
    morph: {
      factory: '0xFf8578C2949148A6F19b7958aE86CAAb2779CDDD',
      fromBlock: 25159,
      blacklistedTokens: [
        '0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a',
        '0xe3C0FF176eF92FC225096C6d1788cCB818808b35',
        '0x950e7FB62398C3CcaBaBc0e3e0de3137fb0daCd2',
      ],
    },
  },
  'bullaexchange': {
    berachain: {
      factory: '0x79164EA9C1AA75d19DDFc71eBEAEA8092D1e71CE',
      fromBlock: 782756,
      isAlgebra: true,
    },
  },
  'butterxyz': {
    mantle: {
      factory: '0xEECa0a86431A7B42ca2Ee5F479832c3D4a4c2644',
      fromBlock: 22966090,
    },
  },
  'capricorn-monad': {
    monad: {
      factory: '0x6B5F564339DbAD6b780249827f2198a841FEB7F3',
      fromBlock: 36628679,
    },
  },
  'catalist-dex': {
    ace: {
      factory: '0xbe2fb231883840b9de5a0f43eb55b71253b0ce7b',
      fromBlock: 10,
    },
  },
  'chadfinance': {
    scroll: {
      factory: '0x0DF45d6e3BC41fd8e50d9e227215413053c003Ad',
      fromBlock: 5288937,
    },
  },
  'chronos-v2': {
    arbitrum: {
      factory: '0x4Db9D624F67E00dbF8ef7AE0e0e8eE54aF1dee49',
      fromBlock: 114041129,
    },
  },
  'clamm': {
    base: {
      factory: '0x51a744E9FEdb15842c3080d0937C99A365C6c358',
      fromBlock: 26899067,
      isAlgebra: true,
    },
  },
  'cleopatra-exchange': {
    mantle: {
      factory: '0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42',
      fromBlock: 34710765,
    },
  },
  'cmswap': {
    jbc: {
      factory: '0x5835f123bDF137864263bf204Cf4450aAD1Ba3a7',
      fromBlock: 4990175,
    },
    bitkub: {
      factory: '0x090C6E5fF29251B1eF9EC31605Bdd13351eA316C',
      fromBlock: 25033350,
    },
  },
  'corexswap': {
    core: {
      factory: '0x526190295AFB6b8736B14E4b42744FBd95203A3a',
      fromBlock: 14045524,
    },
  },
  'crescentswap': {
    arbitrum: {
      factory: '0x8219904A8683d06e38605276baCBf2D29aa764DD',
      fromBlock: 91137559,
    },
    base: {
      factory: '0x3539dA2AdB3f8311D203D334f25f7Bee604A5c50',
      fromBlock: 1979234,
    },
  },
  'crust-finance-v2': {
    mantle: {
      factory: '0xEaD128BDF9Cff441eF401Ec8D18a96b4A2d25252',
      fromBlock: 62692352,
    },
  },
  'currentx-v3': {
    megaeth: {
      factory: '0x09cF8A0b9e8C89bff6d1ACbe1467e8E335Bdd03E',
      fromBlock: 7357543,
    },
  },
  'cyberblast-v3': {
    blast: {
      factory: '0x57eF21959CF9536483bA6ddB10Ad73E2a06b85ff',
      fromBlock: 207530,
      permitFailure: true,
    },
  },
  'cypher-v4': {
    ethereum: {
      factory: '0xfb8Ed3485EfA29a0e4bed93351dD51B59fC4b0f0',
      fromBlock: 23739977,
      isAlgebra: true,
    },
  },
  'dackieswap': {
    base: {
      factory: '0x3D237AC6D2f425D2E890Cc99198818cc1FA48870',
      fromBlock: 2031627,
    },
    optimism: {
      factory: '0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B',
      fromBlock: 115172042,
    },
    arbitrum: {
      factory: '0xaEdc38bD52b0380b2Af4980948925734fD54FbF4',
      fromBlock: 180722131,
    },
    blast: {
      factory: '0xCFC8BfD74422472277fB5Bc4Ec8851d98Ecb2976',
      fromBlock: 8239180,
    },
    inevm: {
      factory: '0xf79A36F6f440392C63AD61252a64d5d3C43F860D',
      fromBlock: 291933,
    },
    mode: {
      factory: '0xc6f3966E5D08Ced98aC30f8B65BeAB5882Be54C7',
      fromBlock: 6102035,
    },
    xlayer: {
      factory: '0xc6f3966e5d08ced98ac30f8b65beab5882be54c7',
      fromBlock: 278971,
    },
    linea: {
      factory: '0xc6255ec7CDb11C890d02EBfE77825976457B2470',
      fromBlock: 8488016,
    },
    wc: {
      factory: '0xB9010964301326160173da694c0697a2FcE82F39',
      fromBlock: 4523073,
    },
    unichain: {
      factory: '0x507940c2469e6E3B33032F1d4FF8d123BDDe2f5C',
      fromBlock: 21155043,
    },
    ethereum: {
      factory: '0x1a4b306ba14d3fb8a49925675f8edb7ef607c422',
      fromBlock: 22866686,
    },
  },
  'dapdap-uniswap': {
    linea: {
      factory: '0x31FAfd4889FA1269F7a13A66eE0fB458f27D72A9',
      fromBlock: 25248,
    },
  },
  'datadex': {
    vana: {
      factory: '0xc2a0d530e57B1275fbce908031DA636f95EA1E38',
      fromBlock: 763744,
      blacklistedTokens: [
        '0xbd2d7c728b224961fdb25ccf2a67eb3c25f5ec52',
        '0x0238966c595619312c0422f02e1e64f37a06439d',
        '0x73bcbf86dea771b1d1e4669657e13399f359c44d',
        '0x2b61bdd5ae69b8a814965cdc21e40f2cba6cf251',
      ],
    },
  },
  'DerpDEX': {
    era: {
      factory: '0x52a1865eb6903bc777a02ae93159105015ca1517',
      fromBlock: 7790768,
    },
    base: {
      factory: '0xeddef4273518b137cdbcb3a7fa1c6a688303dfe2',
      fromBlock: 2753388,
    },
    op_bnb: {
      factory: '0xb91331Ea9539ee881e3A45191076c454E482dAc7',
      fromBlock: 3521514,
    },
  },
  'doveswap-v3': {
    polygon_zkevm: {
      factory: '0xde474db1fa59898bc91314328d29507acd0d593c',
      fromBlock: 99323,
    },
  },
  'dragonswap-v3': {
    klaytn: {
      factory: '0x7431A23897ecA6913D5c81666345D39F27d946A4',
      fromBlock: 145316715,
    },
  },
  'dtx-v3': {
    taiko: {
      factory: '0xfCA1AEf282A99390B62Ca8416a68F5747716260c',
      fromBlock: 105000,
    },
  },
  'echodex-v3': {
    linea: {
      factory: '0x559Fa53Be355835a038aC303A750E8788668636B',
      fromBlock: 120029,
    },
  },
  'eddyfinance-v3': {
    zeta: {
      factory: '0x67AA6B2b715937Edc1Eb4D3b7B5d5dCD1fd93E8C',
      fromBlock: 5478303,
    },
  },
  'electroswap-v3': {
    etn: {
      factory: '0xbF6Bcbe2be545135391777F3B4698be92E2EB8cA',
      fromBlock: 1242016,
    },
  },
  'enosys-dex-v3': {
    songbird: {
      factory: '0x416F1CcBc55033Ae0133DA96F9096Fe8c2c17E7d',
      fromBlock: 69857654,
    },
    flare: {
      factory: '0x17AA157AC8C54034381b840Cb8f6bf7Fc355f0de',
      fromBlock: 29925441,
    },
  },
  'equalizer-cl': {
    fantom: {
      factory: '0x7Ca1dCCFB4f49564b8f13E18a67747fd428F1C40',
      fromBlock: 100367164,
    },
    base: {
      factory: '0x7Ca1dCCFB4f49564b8f13E18a67747fd428F1C40',
      fromBlock: 23864326,
    },
    sonic: {
      factory: '0x7Ca1dCCFB4f49564b8f13E18a67747fd428F1C40',
      fromBlock: 548461,
    },
  },
  'etcswap-v3': {
    ethereumclassic: {
      factory: '0x2624E907BcC04f93C8f29d7C7149a8700Ceb8cDC',
      fromBlock: 19714286,
    },
  },
  'etherex-cl': {
    linea: {
      factory: '0xAe334f70A7FC44FCC2df9e6A37BC032497Cf80f1',
      fromBlock: 21293324,
    },
  },
  'fenix-finance': {
    blast: {
      factory: '0x7a44CD060afC1B6F4c80A2B9b37f4473E74E25Df',
      fromBlock: 1586090,
      isAlgebra: true,
    },
  },
  'fibonacci-dex': {
    formnetwork: {
      factory: '0xbd799BE84dd34B1242e1f7736A6441d6b1540e8b',
      fromBlock: 1,
      isAlgebra: true,
    },
  },
  'firefly': {
    manta: {
      factory: '0x8666EF9DC0cA5336147f1B11f2C4fC2ecA809B95',
      fromBlock: 1776716,
    },
  },
  'flow-swap-v3': {
    flow: {
      factory: '0xca6d7Bb03334bBf135902e1d919a5feccb461632',
      fromBlock: 42141486,
    },
  },
  'fluxion-network': {
    mantle: {
      factory: '0xF883162Ed9c7E8EF604214c964c678E40c9B737C',
      fromBlock: 87631866,
    },
  },
  'FomoSwap-V4': {
    tara: {
      factory: '0x10253594A832f967994b44f33411940533302ACb',
      fromBlock: 20173658,
      isAlgebra: true,
    },
  },
  'forge': {
    evmos: {
      factory: '0xf544365e7065966f190155F629cE0182fC68Eaa2',
      fromBlock: 12367456,
    },
  },
  'fpex': {
    flare: {
      factory: '0xb06df504137c3f393f0f089ebcad5ae7db592c6f',
      fromBlock: 44097841,
    },
  },
  'fusefi-v3': {
    fuse: {
      factory: '0xaD079548b3501C5F218c638A02aB18187F62b207',
      fromBlock: 27175571,
    },
  },
  'fusionx-v3': {
    mantle: {
      factory: '0x530d2766D1988CC1c000C8b7d00334c14B69AD71',
      fromBlock: 2646,
    },
  },
  'ginsengswap': {
    conflux: {
      factory: '0x62aa0294cb42aae39b7772313eadfa5d489146ec',
      fromBlock: 119633031,
    },
  },
  'glowswap-io': {
    bsquared: {
      factory: '0x02eAFbE9dE030f69aF02B7D3F2f69B28016f3C83',
      fromBlock: 1,
      blacklistedTokens: ['0x796e4d53067ff374b89b2ac101ce0c1f72ccaac2'],
    },
  },
  'glyph-v4': {
    core: {
      factory: '0x74EfE55beA4988e7D92D03EFd8ddB8BF8b7bD597',
      fromBlock: 15770796,
      isAlgebra: true,
    },
  },
  'goatswap-v3': {
    goat: {
      factory: '0x3D9c7F529005017aFD0a7fc2CF97D0baF72C5418',
      fromBlock: 108410,
    },
  },
  'goldstation-dex-v3': {
    avax: {
      factory: '0xF72f4652785a5186EDF7b93a9cfd246FeFc0ef5c',
      fromBlock: 52760680,
    },
  },
  'h2-v3': {
    cronos_zkevm: {
      factory: '0x301cbe34dd38Cf69295Bf2698DC9be3B9EECEdFa',
      fromBlock: 79,
    },
  },
  'hardswap': {
    kava: {
      factory: '0xD6E4170C9097A5B5C85E8A39111bF37E47C90076',
      fromBlock: 14523198,
    },
  },
  'henjin': {
    taiko: {
      factory: '0x42B08e7a9211482d3643a126a7dF1895448d3509',
      fromBlock: 400,
      isAlgebra: true,
    },
    base: {
      factory: '0x4963818c35d5793D771bf8091c750b5A71eD101b',
      fromBlock: 24813689,
      isAlgebra: true,
    },
  },
  'hercules-v3': {
    metis: {
      factory: '0xC5BfA92f27dF36d268422EE314a1387bB5ffB06A',
      fromBlock: 8836412,
      isAlgebra: true,
    },
  },
  'hiveswap-v3': {
    map: {
      factory: '0xFF53fAdeA915cac79b55D912fd373545B890f93B',
      fromBlock: 25678,
    },
  },
  'holdstation-swap': {
    era: {
      factory: '0x1153D1d27A558471eF051c5D2D075d7D07B84A07',
      fromBlock: 31199635,
    },
    berachain: {
      factory: '0xCaca5910586473646F294d8FA5530cA9E8E3fc38',
      fromBlock: 782955,
    },
  },
  'honeypop': {
    scroll: {
      factory: '0x1d25AF2b0992bf227b350860Ea80Bad47382CAf6',
      fromBlock: 14223999,
    },
  },
  'horiza': {
    arbitrum: {
      factory: '0x5b1C257B88537d1Ce2AF55a1760336288CcD28B6',
      fromBlock: 130373860,
    },
  },
  'hx-finance': {
    hyperliquid: {
      factory: '0x41ba59415eC75AC4242dd157F2a7A282F1e75652',
      fromBlock: 8953647,
      isAlgebra: true,
    },
  },
  'hybra-v3': {
    hyperliquid: {
      factory: '0x2dC0Ec0F0db8bAF250eCccF268D7dFbF59346E5E',
      fromBlock: 6523521,
    },
  },
  'hydradex': {
    hydra: {
      factory: '0xd555277891c118109b8bd066249D541FF4f993A4',
      fromBlock: 363060,
    },
  },
  'hydrex': {
    base: {
      factory: '0x36077D39cdC65E1e3FB65810430E5b2c4D5fA29E',
      fromBlock: 31648963,
      isAlgebra: true,
      blacklistedTokens: [
        '0x8d9a525463e6891bca541828ddd5c9551d8d6697',
        '0x995bb7f2fc1c628f029baf04204b7b6ab6667271',
        '0x893ade07ce949d9686267898a31fb9660c264276',
      ],
    },
  },
  'hypercat': {
    hyperliquid: {
      factory: '0x1d9DcF8238daf2E078FF639a5Ded6b518BF3E585',
      fromBlock: 4548782,
      isAlgebra: true,
    },
  },
  'hypertrade-v3': {
    hyperliquid: {
      factory: '0x1Cd8363DfAdA19911f745BA984fce02b42c943bF',
      fromBlock: 20255136,
    },
  },
  'icecreamswap-v3': {
    core: {
      factory: '0xa8a3AAD4f592b7f30d6514ee9A863A4cEFF6531D',
      fromBlock: 9212906,
    },
  },
  'infdex': {
    merlin: {
      factory: '0x6701E10b02F4131003510f95419F4EeA59484007',
      fromBlock: 12099773,
    },
  },
  'iswap-tech': {
    btr: {
      factory: '0xad2449234455e0992e1423411df0f8b6fed1feae',
      fromBlock: 1370065,
    },
  },
  'jaine': {
    '0g': {
      factory: '0x9bdcA5798E52e592A08e3b34d3F18EeF76Af7ef4',
      fromBlock: 5938512,
    },
  },
  'katana-v3': {
    ronin: {
      factory: '0x1f0b70d9a137e3caef0ceacd312bc5f81da0cc0c',
      fromBlock: 40105252,
    },
  },
  'kayak-uni-v3': {
    scroll: {
      factory: '0x359d8BC3c4C70b8b73cf911aA5EfEC004146b663',
      fromBlock: 8564317,
    },
  },
  'keller-v3': {
    scroll: {
      factory: '0x952aC46B2586737df679e836d9B980E43E12B2d8',
      fromBlock: 4627488,
    },
  },
  'kim-v4': {
    mode: {
      factory: '0xB5F00c2C5f8821155D8ed27E31932CFD9DB3C5D5',
      fromBlock: 4823915,
      isAlgebra: true,
    },
    base: {
      factory: '0x2F0d41f94d5D1550b79A83D2fe85C82d68c5a3ca',
      fromBlock: 15395969,
      isAlgebra: true,
    },
  },
  'kittenswap-cl': {
    hyperliquid: {
      factory: '0x2E08F5Ff603E4343864B14599CAeDb19918BDCaF',
      fromBlock: 2033100,
      eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, int24 indexed tickSpacing, address pool)',
      topics: ['0xab0d57f0df537bb25e80245ef7748fa62353808c54d6e528a9dd20887aed9ac2'],
    },
  },
  'kittypunch-v3': {
    flow: {
      factory: '0xf331959366032a634c7cAcF5852fE01ffdB84Af0',
      fromBlock: 23492663,
      blacklistedTokens: [],
    },
  },
  'kodiak-v3': {
    berachain: {
      factory: '0xD84CBf0B02636E7f53dB9E5e45A616E05d710990',
      fromBlock: 12314,
      permitFailure: true,
      blacklistedOwners: ['0x24619368bad314d1635a54027c5231b9b83c4a7e', '0xe9703de93406cc31441a57ce5d08272ed545d32b'],
    },
  },
  'kuraswap-cl': {
    sei: {
      factory: '0xd0c54c480fD00DDa4DF1BbE041A6881f2F09111e',
      fromBlock: 161233336,
    },
  },
  'laminar': {
    hyperliquid: {
      factory: '0x40059A6F242C3de0E639693973004921B04D96AD',
      fromBlock: 592235,
      blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb'],
    },
  },
  'linehub-v3': {
    linea: {
      factory: '0x6c379d538f2f7cb642851e154a8e572d63238df4',
      fromBlock: 407280,
    },
  },
  'litxswap': {
    pulse: {
      factory: '0x24398b6ea5434339934D999E431807B1C157b4Fd',
      fromBlock: 17449439,
      isAlgebra: true,
    },
    bsc: {
      factory: '0xbbc7f5605c9cb341d9c41e46ae6ceb30511bdfcf',
      fromBlock: 29291639,
      isAlgebra: true,
    },
  },
  'lolpad': {
    scroll: {
      factory: '0x54E3c605f52B6f297fca5afFC6B9a221fFd65ec2',
      fromBlock: 4204651,
    },
  },
  'lotusdex-v3': {
    mantra: {
      factory: '0xf091964417222474f1835B1bF096995d66303d96',
      fromBlock: 9868586,
    },
  },
  'maia-dao-uni': {
    metis: {
      factory: '0xf5fd18Cd5325904cC7141cB9Daca1F2F964B9927',
      fromBlock: 5212263,
    },
  },
  'mauve': {
    ethereum: {
      factory: '0x0569168709a869e7f4Ba142c49BFF7faA14f76C8',
      fromBlock: 18047375,
    },
  },
  'metavault-v3': {
    linea: {
      factory: '0x9367c561915f9D062aFE3b57B18e30dEC62b8488',
      fromBlock: 652486,
    },
    scroll: {
      factory: '0x9367c561915f9D062aFE3b57B18e30dEC62b8488',
      fromBlock: 77008,
      blacklistedTokens: ['0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f'],
    },
  },
  'methlab-xyz': {
    mantle: {
      factory: '0x8f140Fc3e9211b8DC2fC1D7eE3292F6817C5dD5D',
      fromBlock: 59915640,
    },
  },
  'mimoswap-v3': {
    iotex: {
      factory: '0xF36788bF206f75F29f99Aa9d418fD8164b3B8198',
      fromBlock: 27707694,
      blacklistedTokens: ['0x95cb18889b968ababb9104f30af5b310bd007fd8'],
    },
  },
  'mintswap-finance-v3': {
    mint: {
      factory: '0x1f88BB455E02646224A0a65f3eb4B2FCb4fb8e49',
      fromBlock: 1025232,
    },
  },
  'mm-finance-arbitrum-v3': {
    arbitrum: {
      factory: '0x947bc57CEFDd22420C9a6d61387FE4D4cf8A090d',
      fromBlock: 72404739,
    },
  },
  'moai-fi-v3': {
    xrplevm: {
      factory: '0x678100B9095848FCD4AE6C79A7D29c11815D07fe',
      fromBlock: 1,
    },
  },
  'molten-v4': {
    core: {
      factory: '0x74EfE55beA4988e7D92D03EFd8ddB8BF8b7bD597',
      fromBlock: 15770796,
      isAlgebra: true,
    },
  },
  'monday-trade-spot': {
    monad: {
      factory: '0xc1e98d0a2a58fb8abd10ccc30a58efff4080aa21',
      fromBlock: 35093818,
      permitFailure: true,
    },
  },
  'monocerus': {
    avax: {
      factory: '0x8d312c2B300239B84c304B5af5A3D00cBF0803F6',
      fromBlock: 31524862,
    },
    manta: {
      factory: '0x481F4b658d1447A9559B220640Fb79C2B993032A',
      fromBlock: 743017,
    },
  },
  'monoswap-v3': {
    blast: {
      factory: '0x48d0F09710794313f33619c95147F34458BF7C3b',
      fromBlock: 172327,
    },
  },
  'moraswap-v3': {
    neon_evm: {
      factory: '0x58122246F7e33669cde3486Dd72f95c2e886E375',
      fromBlock: 237396579,
      isAlgebra: false,
    },
  },
  'MorFi': {
    morph: {
      factory: '0x1be404c921ef85537233ef2be251a27583072861',
      fromBlock: 166014,
      isAlgebra: true,
    },
  },
  'mori': {
    tomochain: {
      factory: '0xD1A76A4F4ff2AD3f899438Ea0e919049fC0a21BF',
      fromBlock: 74340484,
    },
  },
  'naka-dex': {
    naka: {
      factory: '0xf6632D6fF6fc71DAf1fA96AbAd1bC269bD507dF8',
      fromBlock: 49370,
      sumChunkSize: 50,
    },
  },
  'nest-platform': {
    hyperliquid: {
      factory: '0xF77Bd082c627aA54591cF2f2EaA811fd1AB3b1F3',
      fromBlock: 17877130,
      isAlgebra: true,
      blacklistedOwners: ['0xbAd2fB864FBD3f8b9bCC81512D7C8Ee1Aa0a8D6C'],
    },
  },
  'nile-exchange': {
    linea: {
      factory: '0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42',
      fromBlock: 1768897,
    },
  },
  'novaswap': {
    zklink: {
      factory: '0xf8D35842f37800E349A993503372fb9E2CBb7E3d',
      fromBlock: 1676253,
    },
  },
  'novaswap-v2': {
    zklink: {
      factory: '0x9f94c91b178F5bc9fCcA3e5428b09A3d01CE5AC6',
      fromBlock: 3416798,
    },
  },
  'nuri-exchange': {
    scroll: {
      factory: '0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42',
      fromBlock: 5300905,
    },
  },
  'ocelex': {
    zircuit: {
      factory: '0x03057ae6294292b299a1863420edD65e0197AFEf',
      fromBlock: 3709368,
      isAlgebra: true,
    },
  },
  'octoswap-cl': {
    monad: {
      factory: '0x30Db57A29ACf3641dfc3885AF2e5f1F5A408D9CB',
      fromBlock: 33818287,
      permitFailure: true,
    },
  },
  'omni-exchange': {
    bsc: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 54053000,
    },
    arbitrum: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 357770000,
    },
    avax: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 65460000,
    },
    base: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 32873000,
    },
    optimism: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 138469000,
    },
    sonic: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 38533000,
    },
    plasma: {
      factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2',
      fromBlock: 2531200,
    },
  },
  'pacificswap-v3': {
    manta: {
      factory: '0x0420ec530da3becaac33b0e8702756195cd847fe',
      fromBlock: 247429,
    },
  },
  'pancakeswap-v3': {
    bsc: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 26956207,
      blacklistedTokens: [
        '0x860368babf32129c18306a70ce7db10c5b437072',
        '0xc476d3961f77645464acccce404eb17815a80878',
        '0xf8c7f403829cc0f9a37f126a3da41358c232acdf',
        '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1',
        '0x454f4597582df557c2757403f47d3f3bbb890d43',
        '0xf1917602fff55a5ebccc7d03aead225dd9bf3776',
        '0x121a3fba8456ebce13964363ba35fea00c2aa3d2',
        '0xd24616870ca41bc01074446988faeb0085a71190',
        '0xb4357054c3dA8D46eD642383F03139aC7f090343',
      ],
    },
    ethereum: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 16950685,
    },
    polygon_zkevm: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 750148,
    },
    linea: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 1445,
    },
    era: {
      factory: '0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB',
      fromBlock: 9413438,
    },
    arbitrum: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 101028949,
      blacklistedTokens: ['0x12d773bb0c679d4dfbaf700086dc5e399656f892', '0x1a6b3a62391eccaaa992ade44cd4afe6bec8cff1'],
    },
    base: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 2912007,
    },
    op_bnb: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 1721753,
    },
    monad: {
      factory: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      fromBlock: 23058782,
    },
  },
  'pangolin-v3': {
    avax: {
      factory: '0x1128F23D0bc0A8396E9FBC3c0c68f5EA228B8256',
      fromBlock: 59708285,
    },
    monad: {
      factory: '0x44805F92db5bB31B54632A55fc4b2B7E885B0e0e',
      fromBlock: 37771314,
    },
  },
  'panko': {
    taiko: {
      factory: '0x99960D7076297a1E0C86f3cc60FfA5d6f2B507B5',
      fromBlock: 433329,
    },
  },
  'parity-dex-cl': {
    monad: {
      factory: '0x2A6CE23C5017aF1b07B9c4E4014442aDE18Bd404',
      fromBlock: 54650081,
    },
  },
  'pegasys-v3': {
    rollux: {
      factory: '0xeAa20BEA58979386A7d37BAeb4C1522892c74640',
      fromBlock: 87430,
    },
  },
  'pepu-v3': {
    pepu: {
      factory: '0x5984B8BF2d4dB9C0aCB1d7924762e4474D80C807',
      fromBlock: 20,
      blacklistedTokens: ['0x411caba7dd4c4653ebd5fbba4406855859e21485'],
    },
  },
  'pharaoh-exchange': {
    avax: {
      factory: '0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42',
      fromBlock: 38764597,
    },
  },
  'pharaoh-exchange-v3': {
    avax: {
      factory: '0xAE6E5c62328ade73ceefD42228528b70c8157D0d',
      fromBlock: 68700645,
    },
  },
  'pinot-v3': {
    monad: {
      factory: '0x7716F310d62Aee3d009fd94067c627fe7E2f2aA9',
      fromBlock: 36151690,
    },
  },
  'piperx-v3': {
    sty: {
      factory: '0xb8c21e89983B5EcCD841846eA294c4c8a89718f1',
      fromBlock: 1,
    },
  },
  'prjx': {
    hyperliquid: {
      factory: '0xff7b3e8c00e57ea31477c32a5b52a58eea47b072',
      fromBlock: 7876741,
    },
  },
  'quickswap-v3': {
    polygon: {
      factory: '0x411b0facc3489691f28ad58c47006af5e3ab3a28',
      fromBlock: 32610688,
      isAlgebra: true,
      permitFailure: true,
    },
    dogechain: {
      factory: '0xd2480162aa7f02ead7bf4c127465446150d58452',
      fromBlock: 837574,
      isAlgebra: true,
    },
    polygon_zkevm: {
      factory: '0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57',
      fromBlock: 300,
      isAlgebra: true,
    },
    manta: {
      factory: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
      fromBlock: 357492,
    },
    astrzk: {
      factory: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
      fromBlock: 93668,
    },
    imx: {
      factory: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
      fromBlock: 356091,
    },
    xlayer: {
      factory: '0xd2480162aa7f02ead7bf4c127465446150d58452',
      fromBlock: 277686,
      isAlgebra: true,
    },
    soneium: {
      factory: '0x8Ff309F68F6Caf77a78E9C20d2Af7Ed4bE2D7093',
      fromBlock: 1681559,
      isAlgebra: true,
    },
  },
  'quickswap-v4': {
    base: {
      factory: '0xC5396866754799B9720125B104AE01d935Ab9C7b',
      isAlgebra: true,
      fromBlock: 30736835,
    },
    soneium: {
      factory: '0x8Ff309F68F6Caf77a78E9C20d2Af7Ed4bE2D7093',
      isAlgebra: true,
      fromBlock: 1681559,
    },
    xlayer: {
      factory: '0x0284d1a8336E08AE0D3e30e7B0689Fa5B68E6310',
      isAlgebra: true,
      fromBlock: 3073933,
    },
    somnia: {
      factory: '0x0ccff3D02A3a200263eC4e0Fdb5E60a56721B8Ae',
      isAlgebra: true,
      fromBlock: 40341077,
    },
  },
  'ra': {
    fraxtal: {
      factory: '0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42',
      fromBlock: 1352717,
    },
  },
  'rabbitswap-v3': {
    tomochain: {
      factory: '0x1F09b50e8cbAed8A157fEe28716d13AfE36A77E7',
      fromBlock: 86787787,
      isAlgebra: false,
    },
  },
  'ramses-cl': {
    arbitrum: {
      factory: '0xaa2cd7477c451e703f3b9ba5663334914763edf8',
      fromBlock: 90593047,
    },
    hyperliquid: {
      factory: '0x07E60782535752be279929e2DFfDd136Db2e6b45',
      fromBlock: 17985840,
    },
  },
  'ramses-hl-cl': {
    hyperliquid: {
      factory: '0x07E60782535752be279929e2DFfDd136Db2e6b45',
      fromBlock: 18149975,
    },
  },
  'reservoir-tools-v3': {
    abstract: {
      factory: '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1',
      fromBlock: 1,
    },
    zero_network: {
      factory: '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1',
      fromBlock: 1,
    },
    shape: {
      factory: '0xeCf9288395797Da137f663a7DD0F0CDF918776F8',
      fromBlock: 1,
    },
    redstone: {
      factory: '0xece75613Aa9b1680f0421E5B2eF376DF68aa83Bb',
      fromBlock: 1,
    },
    ink: {
      factory: '0x640887A9ba3A9C53Ed27D0F7e8246A4F933f3424',
      fromBlock: 1,
    },
  },
  'retro': {
    polygon: {
      factory: '0x91e1B99072f238352f59e58de875691e20Dc19c1',
      fromBlock: 43939793,
    },
  },
  'satsuma': {
    citrea: {
      factory: '0x10253594A832f967994b44f33411940533302ACb',
      fromBlock: 100000,
      isAlgebra: true,
    },
  },
  'saucerswap-v2': {
    hedera: {
      factory: '0x00000000000000000000000000000000003c3951',
      fromBlock: 55651154,
    },
  },
  'scribe-v4': {
    scroll: {
      factory: '0xDc62aCDF75cc7EA4D93C69B2866d9642E79d5e2e',
      fromBlock: 7680915,
      isAlgebra: true,
    },
  },
  'secta-v3': {
    linea: {
      factory: '0x9BD425a416A276C72a13c13bBd8145272680Cf07',
      fromBlock: 2388856,
    },
  },
  'settlex-v3': {
    stable: {
      factory: '0x202bEE65B164aEcBb6A2318438bf46bEF14E1072',
      fromBlock: 2779227,
    },
  },
  'shadow-cl': {
    sonic: {
      factory: '0xcD2d0637c94fe77C2896BbCBB174cefFb08DE6d7',
      fromBlock: 1705910,
    },
  },
  'sheepdex': {
    bsc: {
      factory: '0x571521f8c16f3c4ed5f2490f19187ba7a5a3cbdf',
      fromBlock: 11640600,
    },
  },
  'shibaswap-v2': {
    ethereum: {
      factory: '0xD9CE49caf7299DaF18ffFcB2b84a44fD33412509',
      fromBlock: 21036458,
    },
    shibarium: {
      factory: '0x2996B636663ddeBaE28742368ed47b57539C9600',
      fromBlock: 7518119,
    },
  },
  'silverswap': {
    sonic: {
      factory: '0xb860200BD68dc39cEAfd6ebb82883f189f4CdA76',
      fromBlock: 186117,
      isAlgebra: true,
    },
    nibiru: {
      factory: '0xb860200BD68dc39cEAfd6ebb82883f189f4CdA76',
      fromBlock: 19674297,
      isAlgebra: true,
    },
  },
  'simitci-v3': {
    bitci: {
      factory: '0x53261c4f95187c8B79F0836da59334B267aFef60',
      fromBlock: 8680779,
    },
  },
  'skullswap-v3': {
    fantom: {
      factory: '0x39eae0e8e8a733bcc1165a1e538a98fe8c46e183',
      fromBlock: 56614737,
      isAlgebra: true,
    },
  },
  'smbswap-v3': {
    bsc: {
      factory: '0xa9b5d4eac94cb98117abdcc0ecbd7731960f91d9',
      fromBlock: 27043748,
      isAlgebra: false,
    },
  },
  'sonex': {
    soneium: {
      factory: '0x3E4ff8662820E3dec3DACDb66ef1FFad5Dc5Ab83',
      fromBlock: 1,
    },
  },
  'sonusexchange-cl': {
    soneium: {
      factory: '0x253240C98b2eeEF1bD3D5939A882ED9BD75216d1',
      fromBlock: 1696007,
    },
  },
  'sparkdex-v3': {
    flare: {
      factory: '0xb3fB4f96175f6f9D716c17744e5A6d4BA9da8176',
      fromBlock: 26046709,
    },
  },
  'sparkdex-v3-1': {
    flare: {
      factory: '0x8A2578d23d4C532cC9A98FaD91C0523f5efDE652',
      fromBlock: 30717263,
    },
  },
  'sparkdex-v4': {
    flare: {
      factory: '0x805488DaA81c1b9e7C5cE3f1DCeA28F21448EC6A',
      fromBlock: 54459760,
      isAlgebra: true,
    },
  },
  'spiritswap-v3': {
    fantom: {
      factory: '0xb860200bd68dc39ceafd6ebb82883f189f4cda76',
      fromBlock: 78654346,
      isAlgebra: true,
    },
  },
  'spookyswap-v3': {
    fantom: {
      factory: '0x7928a2c48754501f3a8064765ECaE541daE5c3E6',
      fromBlock: 70992836,
      blacklistedTokens: ['0x6e5e3ce13e2c7d4de000f93c4909164d0aa59f0b'],
    },
    bittorrent: {
      factory: '0xE12b00681dD2e90f51d9Edf55CE1A7D171338165',
      fromBlock: 26441276,
    },
    sonic: {
      factory: '0x3D91B700252e0E3eE7805d12e048a988Ab69C8ad',
      fromBlock: 286535,
    },
  },
  'SquadSwap-v3': {
    bsc: {
      factory: '0x009c4ef7C0e0Dd6bd1ea28417c01Ea16341367c3',
      fromBlock: 34184408,
    },
    base: {
      factory: '0xa1288b64F2378276d0Cc56F08397F70BecF7c0EA',
      fromBlock: 19730499,
    },
    blast: {
      factory: '0x6Ea64BDCa26F69fdeF36C1137A0eAe5Bf434e8fd',
      fromBlock: 5644236,
    },
    arbitrum: {
      factory: '0x0558921f7C0f32274BB957D5e8BF873CE1c0c671',
      fromBlock: 253170358,
    },
    polygon: {
      factory: '0x633Faf3DAc3677b51ea7A53a81b79AEe944714dc',
      fromBlock: 61864971,
    },
    optimism: {
      factory: '0xa1288b64F2378276d0Cc56F08397F70BecF7c0EA',
      fromBlock: 125326692,
    },
  },
  'SquadSwap-WOW': {
    bsc: {
      factory: '0x10d8612D9D8269e322AB551C18a307cB4D6BC07B',
      fromBlock: 46190543,
    },
  },
  'stellaswap-v3': {
    moonbeam: {
      factory: '0xabe1655110112d0e45ef91e94f8d757e4ddba59c',
      fromBlock: 2649801,
      isAlgebra: true,
      permitFailure: true,
    },
  },
  'stellaswap-v4': {
    moonbeam: {
      factory: '0x90dD87C994959A36d725bB98F9008B0b3C3504A0',
      fromBlock: 9521226,
      isAlgebra: true,
      permitFailure: true,
    },
  },
  'storyhunt-v3': {
    sty: {
      factory: '0xa111dDbE973094F949D78Ad755cd560F8737B7e2',
      fromBlock: 1,
      blacklistedTokens: ['0x5fbdb2315678afecb367f032d93f642f64180aa3', '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'],
    },
  },
  'supswap-v3': {
    mode: {
      factory: '0xa0b018Fe0d00ed075fb9b0eEe26d25cf72e1F693',
      fromBlock: 3061677,
    },
  },
  'surgedefi': {
    xrplevm: {
      factory: '0x05655ae2c8f310387B85DCB3785b8756F1759d86',
      fromBlock: 123251,
    },
  },
  'sushiswap-v3': {
    ethereum: {
      factory: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F',
      fromBlock: 16955547,
      permitFailure: true,
    },
    arbitrum: {
      factory: '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e',
      fromBlock: 75998697,
      blacklistedTokens: ['0x920675303c7460c86a5b24053db1176a52b85ba6'],
      permitFailure: true,
    },
    optimism: {
      factory: '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0',
      fromBlock: 85432013,
      permitFailure: true,
    },
    polygon: {
      factory: '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2',
      fromBlock: 41024971,
      permitFailure: true,
    },
    arbitrum_nova: {
      factory: '0xaa26771d497814e81d305c511efbb3ced90bf5bd',
      fromBlock: 4242300,
      permitFailure: true,
    },
    avax: {
      factory: '0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715',
      fromBlock: 28186391,
      permitFailure: true,
    },
    bsc: {
      factory: '0x126555dd55a39328F69400d6aE4F782Bd4C34ABb',
      fromBlock: 26976538,
      permitFailure: true,
    },
    fantom: {
      factory: '0x7770978eED668a3ba661d51a773d3a992Fc9DDCB',
      fromBlock: 58860670,
      permitFailure: true,
    },
    fuse: {
      factory: '0x1b9d177CcdeA3c79B6c8F40761fc8Dc9d0500EAa',
      fromBlock: 22556035,
      permitFailure: true,
    },
    xdai: {
      factory: '0xf78031CBCA409F2FB6876BDFDBc1b2df24cF9bEf',
      fromBlock: 27232871,
      permitFailure: true,
    },
    moonbeam: {
      factory: '0x2ecd58F51819E8F8BA08A650BEA04Fc0DEa1d523',
      fromBlock: 3264275,
      permitFailure: true,
    },
    moonriver: {
      factory: '0x2F255d3f3C0A3726c6c99E74566c4b18E36E3ce6',
      fromBlock: 3945310,
      permitFailure: true,
    },
    polygon_zkevm: {
      factory: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      fromBlock: 80860,
      permitFailure: true,
    },
    thundercore: {
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      fromBlock: 132536332,
      permitFailure: true,
    },
    base: {
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      fromBlock: 1759510,
      blacklistedTokens: ['0xcfca86136af5611e4bd8f82d83c7800ca65d875b', '0x0b0fd8317735dd9fe611fbc7e1d138149f8ebcea'],
      permitFailure: true,
    },
    core: {
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      fromBlock: 5211850,
      permitFailure: true,
    },
    linea: {
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      fromBlock: 53256,
      permitFailure: true,
    },
    scroll: {
      factory: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      fromBlock: 82522,
      permitFailure: true,
    },
    kava: {
      factory: '0x1e9B24073183d5c6B7aE5FB4b8f0b1dd83FDC77a',
      fromBlock: 7251753,
      permitFailure: true,
    },
    metis: {
      factory: '0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F',
      fromBlock: 9077930,
      permitFailure: true,
    },
    bittorrent: {
      factory: '0xBBDe1d67297329148Fe1ED5e6B00114842728e65',
      fromBlock: 29265724,
      permitFailure: true,
    },
    blast: {
      factory: '0x7680d4b43f3d1d54d6cfeeb2169463bfa7a6cf0d',
      fromBlock: 284122,
      permitFailure: true,
    },
    sonic: {
      factory: '0x46B3fDF7B5cde91Ac049936bF0Bdb12C5D22202E',
      fromBlock: 1,
      permitFailure: true,
    },
    hemi: {
      factory: '0xCdBCd51a5E8728E0AF4895ce5771b7d17fF71959',
      fromBlock: 507517,
      permitFailure: true,
    },
    katana: {
      factory: '0x203e8740894c8955cB8950759876d7E7E45E04c1',
      fromBlock: 1858973,
      permitFailure: true,
    },
  },
  'swap-taiko': {
    taiko: {
      factory: '0x826D713e30f0bF09Dd3219494A508E6B30327d4f',
      fromBlock: 3222506,
    },
  },
  'swapbased-cl': {
    base: {
      hallmarks: [
        ['2024-05-06', 'change contracts'],
      ],
      factory: '0xb5620F90e803C7F957A9EF351B8DB3C746021BEa',
      fromBlock: 13766585,
    },
  },
  'swapblast-v3': {
    blast: {
      factory: '0x3e1402b653f219D0840A44CBF7FD8F193C2a348A',
      fromBlock: 598283,
    },
  },
  'swapmode-v3': {
    mode: {
      factory: '0x6E36FC34eA123044F278d3a9F3819027B21c9c32',
      fromBlock: 5005167,
    },
  },
  'swapr-v3': {
    xdai: {
      factory: '0xa0864cca6e114013ab0e27cbd5b6f4c8947da766',
      fromBlock: 30096640,
      isAlgebra: true,
    },
  },
  'SwapX-algebra': {
    sonic: {
      factory: '0x8121a3F8c4176E9765deEa0B95FA2BDfD3016794',
      fromBlock: 1440914,
      isAlgebra: true,
    },
  },
  'swyrl-cl': {
    monad: {
      factory: '0x02a898F85a6984213Ac6d2577ff3406394172abf',
      fromBlock: 34623300,
    },
  },
  'synstation': {
    soneium: {
      factory: '0x81B4029bfCb5302317fe5d35D54544EA3328e30f',
      fromBlock: 1812231,
    },
  },
  'synthswap-v3': {
    base: {
      factory: '0xa37359e63d1aa44c0acb2a4605d3b45785c97ee3',
      fromBlock: 2095251,
      isAlgebra: true,
    },
  },
  'tangleswap': {
    milkomeda: {
      factory: '0xda2f048C128506e720b0b0b32F20432157dde1c7',
      fromBlock: 19701714,
      staking: ['0xbDD88a555cB49b6b482850aA50c1c2C74fa3367a', '0x6085C822B7A4c688D114468B1380a0Ed1873a0B3'],
    },
  },
  'taraswap': {
    tara: {
      factory: '0x5EFAc029721023DD6859AFc8300d536a2d6d4c82',
      fromBlock: 10674828,
    },
  },
  'tealswap-v3': {
    oas: {
      factory: '0xe3fc2cB6E8c2671816D15B556B47375Afb2C29bD',
      fromBlock: 2445228,
    },
  },
  'tesseractworld': {
    ace: {
      factory: '0x699cf93f5dec3a3e314f0a31c1f885fb11b983c3',
      fromBlock: 197972,
    },
  },
  'thena-integral': {
    bsc: {
      factory: '0x30055F87716d3DFD0E5198C27024481099fB4A98',
      fromBlock: 44121855,
      isAlgebra: true,
      blacklistedTokens: ['0x39e3ca118ddfea3edc426b306b87f43da3251b4a'],
    },
  },
  'thena-v3': {
    bsc: {
      factory: '0x306F06C147f064A010530292A1EB6737c3e378e4',
      fromBlock: 26030310,
      isAlgebra: true,
      blacklistedTokens: [
        '0x39e3ca118ddfea3edc426b306b87f43da3251b4a',
        '0xe80772eaf6e2e18b651f160bc9158b2a5cafca65',
        '0x5335e87930b410b8c5bb4d43c3360aca15ec0c8c',
      ],
    },
  },
  'Thick': {
    fantom: {
      factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24',
      fromBlock: 70309749,
    },
    arbitrum: {
      factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24',
      fromBlock: 148243463,
    },
    base: {
      factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24',
      fromBlock: 6314325,
    },
    sonic: {
      factory: '0xE6dA85feb3B4E0d6AEd95c41a125fba859bB9d24',
      fromBlock: 444927,
    },
  },
  'throne-v3': {
    base: {
      factory: '0xe8839bf8175812691c6578c0fc80e721bc3e00fb',
      fromBlock: 2146977,
    },
  },
  'thruster-fi': {
    blast: {
      factory: '0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127',
      fromBlock: 157106,
    },
  },
  'trebleswap': {
    base: {
      factory: '0xAC900f12fB25d514e3ccFE8572B153A9991cA4e7',
      fromBlock: 25118568,
      isAlgebra: true,
    },
  },
  'ubeswap-v3': {
    celo: {
      factory: '0x67FEa58D5a5a4162cED847E13c2c81c73bf8aeC4',
      fromBlock: 25639915,
    },
  },
  'unchain-x': {
    bsc: {
      factory: '0x82fA7b2Ce2A76C7888A9D3B0a81E0b2ecfd8d40c',
      fromBlock: 41176898,
    },
  },
  'universal-swaps': {
    lukso: {
      factory: '0x8130c332dddf8964b08eab86aad3999017436a6e',
      fromBlock: 1939261,
    },
  },
  'vanillaswap-v3': {
    defichain_evm: {
      factory: '0x9C444DD15Fb0Ac0bA8E9fbB9dA7b9015F43b4Dc1',
      fromBlock: 147204,
    },
  },
  'vapordex-v2': {
    avax: {
      factory: '0x62B672E531f8c11391019F6fba0b8B6143504169',
      fromBlock: 36560289,
    },
    telos: {
      factory: '0x62B672E531f8c11391019F6fba0b8B6143504169',
      fromBlock: 312329030,
    },
    apechain: {
      factory: '0x62B672E531f8c11391019F6fba0b8B6143504169',
      fromBlock: 2671998,
    },
  },
  'voltage-v4': {
    fuse: {
      factory: '0xccEdb990abBf0606Cf47e7C6A26e419931c7dc1F',
      fromBlock: 32498119,
      isAlgebra: true,
    },
  },
  'vvs-v3': {
    cronos: {
      factory: '0x40aB11c64E9fF5368F09343Ac860dAfA34e14C35',
      fromBlock: 10292950,
    },
  },
  'w-dex': {
    polygon: {
      factory: '0x215fDE4B415B9Ce21DEE6CAcEfc27Aa92441C4AA',
      fromBlock: 65913036,
      isAlgebra: true,
    },
  },
  'warpgate': {
    imx: {
      factory: '0x464Ea59a3AA5Ea35e961Ff8aA4CCC7183eAA197e',
      fromBlock: 2863799,
    },
  },
  'wasabee': {
    berachain: {
      factory: '0x7d53327D78EFD0b463bd8d7dc938C52402323b95',
      fromBlock: 786501,
      isAlgebra: true,
    },
  },
  'wemix-v3': {
    wemix: {
      factory: '0x8EFf28B531B731814e4E4fFfa0F7Bd0FC50f370F',
      fromBlock: 33104424,
    },
  },
  'winnieswap': {
    berachain: {
      factory: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63',
      fromBlock: 2500000,
    },
  },
  'xflows': {
    wan: {
      factory: '0xEB3e557f6FdcaBa8dC98BDA833E017866Fc168cb',
      fromBlock: 33432686,
      blacklistedTokens: ['0xd907b5d927e70aa431fd6a79f91133596414c8a2', '0xc75180d1b5498d8b998dfc2d30e819ca39c6e7d9'],
      permitFailure: true,
    },
  },
  'xspswap-v3': {
    xdc: {
      factory: '0x30F317A9EC0f0D06d5de0f8D248Ec3506b7E4a8A',
      fromBlock: 59782067,
      methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
      permitFailure: true,
    },
  },
  'xtrade': {
    xlayer: {
      factory: '0x612D9EA08be59479B112D8d400C7F0A2E4aD4172',
      fromBlock: 813172,
      isAlgebra: true,
    },
  },
  'zebra-v2': {
    scroll: {
      factory: '0x96a7F53f7636c93735bf85dE416A4Ace94B56Bd9',
      fromBlock: 810032,
    },
  },
  'zendex': {
    manta: {
      factory: '0x4Eee19e0856D23fAc3D0bDD867bEb4E1B8c78344',
      fromBlock: 39246,
    },
  },
  'zkSwap-finance-v3': {
    era: {
      factory: '0x88ADD6a7e3C221e02f978B388a092c9FD8cd7850',
      fromBlock: 49205949,
    },
    sonic: {
      factory: '0x6D977fCC945261B80D128A5a91cbF9a9148032A4',
      fromBlock: 18849171,
      blacklistedTokens: ['0xE0590015A873bF326bd645c3E1266d4db41C4E6B', '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50'],
    },
    monad: {
      factory: '0xf5Cf2b71B8B368c84C4C4903AF453E790d392285',
      fromBlock: 37612083,
    },
  },
  'zyberswap-v3': {
    arbitrum: {
      factory: '0x9c2abd632771b433e5e7507bcaa41ca3b25d8544',
      fromBlock: 62714800,
      isAlgebra: true,
    },
    optimism: {
      factory: '0x0c8f7b0cb986b31c67d994fb5c224592a03a4afd',
      fromBlock: 105900073,
      isAlgebra: true,
    },
  },
}

module.exports = buildProtocolExports(uniV3Configs, uniV3Export)
