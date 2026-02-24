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
      staking: ['0x627A83B6f8743c89d58F17F994D3F7f69c32F461', '0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca'],
      pool2: [['0x8D426Eb8C7E19b8F13817b07C0AB55d30d209A96', '0xcB0b0419E6a1F46Be89C1c1eeeAf9172b7125b29'], ['0xbdC7DFb7B88183e87f003ca6B5a2F81202343478', '0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52']],
    },
  },
  'bombmoney': {
    bsc: {
      staking: ['0xcAF7D9CE563E361A304FB6196499c1Dfd11b5991', '0x531780FAcE85306877D7e1F05d713D1B50a37F7A'],
      pool2: ['0x1083926054069AaD75d7238E9B809b0eF9d94e5B', ['0x1303246855b5B5EbC71F049Fdb607494e97218f8', '0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6']],
    },
  },
  'grape-finance': {
    avax: {
      staking: ['0x3ce7bC78a7392197C569504970017B6Eb0d7A972', '0xC55036B5348CfB45a932481744645985010d3A44'],
      pool2: ['0x28c65dcB3a5f0d456624AFF91ca03E4e315beE49', ['0x00cB5b42684DA62909665d8151fF80D1567722c3', '0xb382247667fe8CA5327cA1Fa4835AE77A9907Bc8', '0xd3d477Df7f63A2623464Ff5Be6746981FdeD026F']],
    },
  },
  'nacho-finance': {
    methodology: "Pool2 deposits consist of NACHO/ETH, NSHARE/MATIC LP, ETH/MATIC LP, ETH/USDC LP and NBOND tokens deposits while the staking TVL consists of the NSHARE tokens locked within the Bowl contract.",
    polygon: {
      staking: ['0x1ad667aCe03875fe48534c65BFE14191CF81fd64', '0x948D0a28b600BDBd77AF4ea30E6F338167034181'],
      pool2: ['0xdD694F459645eb6EfAE934FE075403760eEb9aA1', ['0x2bAe87900Cbd645da5CA0d7d682C5D2e172946f2', '0x2c97767BFa132E3785943cf14F31ED3f025405Ea', '0xcD90217f76F3d8d5490FD0434F597516767DaDe1', '0x354789e7bBAC6E3d3143A0457324cD80bD0BE050']],
    },
  },
  'tempus': {
    ethereum: {
      staking: ['0x6C6D4753a1107585121599746c2E398cCbEa5119', '0xA36FDBBAE3c9d55a1d67EE5821d53B50B63A1aB9'],
    },
    fantom: {},
  },

  // ============================================================
  // Tomb forks (tombTvl, tokensOnCoingecko=true) - array staking + array pool2
  // ============================================================

  'snowyowl': {
    misrepresentedTokens: true,
    avax: {
      staking: ['0x264C36747b6cC5243d8999345FFf8F220B7CCc77', '0xe7A102Fbc8AB3581d62830DdB599eCCaae5e7875'],
      pool2: ['0xb7d3dc568F7dF54d516D37739912Fc2E541Ba2fF', ['0xe63b66a8cf7811525cd15dab15f17fb62aa5af2f', '0x3e262be2339069cec95552683c1eb3f513adcc66', '0x061349a57b702ebe3139ca419457bb23f7e0d8a2']],
    },
  },
  'dibs-money': {
    bsc: {
      staking: ['0xf65c374a91f47f8732a86acc49c74df4db8b2f1f', '0x26d3163b165be95137cee97241e716b2791a7572'],
      pool2: ['0x8f75dfc6a598b00cc18edce9e458451f3742007d', ['0x9bebe118018d0de55b00787b5eeabb9eda8a9e0a', '0x5998af8868e5e4fbd7c60da221b76b201e441612']],
    },
  },
  'gaur': {
    cronos: {
      staking: ['0x73c34f572a428c0fc298e9a2ae45d01e87713e8f', '0x66ec6e9f61ac288f5ba661cd9a2dbe3abf9871c9'],
      pool2: ['0x4d24484a5944b6a8e2bc9af74c6d44c47767b150', ['0xe34973e9c89a9a1d2886379ce52d32dde296ca22', '0x9f4daa971e76e3d0c68c9983125e35c0f89b077a', '0xe61Db569E231B3f5530168Aa2C9D50246525b6d6', '0x062b7d86c51aa3b2ec998272b5bd0609e95b3661', '0xfd0cd0c651569d1e2e3c768ac0ffdab3c8f4844f', '0xa111c17f8b8303280d3eb01bbcd61000aa7f39f9']],
    },
  },
  'frozen-walrus': {
    avax: {
      staking: ['0x38B0b6Ef43c4262659523986D731f9465F871439', '0xe6d1aFea0B76C8f51024683DD27FA446dDAF34B6'],
      pool2: ['0x752FEacFdA5c3B440Fd6D40ECf338a86b568c2d2', ['0x82845B52b53c80595bbF78129126bD3E6Fc2C1DF', '0x03d15E0451e54Eec95ac5AcB5B0a7ce69638c62A']],
    },
  },
  'emp-money': {
    misrepresentedTokens: true,
    bsc: {
      staking: ['0xe9baceea645e8be68a0b63b9764670f97a50942f', '0xDB20F6A8665432CE895D724b417f77EcAC956550'],
      pool2: ['0x97a68a7949ee30849d273b0c4450314ae26235b1', ['0x1747AF98EBF0B22d500014c7dd52985d736337d2', '0x84821bb588f049913Dc579Dc511E5e31EB22d5E4']],
    },
  },

  // ============================================================
  // Tomb forks (tombTvl, tokensOnCoingecko=false) - object staking + array pool2
  // ============================================================

  'draco-finance': {
    fantom: {
      staking: { owners: ['0x39AEd2eC961AA9da9D778C80B6f90CD80dBFAE16'], tokens: ['0x713A18d059EA1D12E5bE134a864C075E47d5FEFA'], lps: ['0xf4b787e9319ec4a83ac4fabc88ae1705c2c64031'], useDefaultCoreAssets: true },
      pool2: ['0x14b9189c9a7f31Fda0eed6B8D8afe91E098B303b', ['0xa7207b4de8ba1f01adb7c59558ebebf8c4e48c53', '0xf4b787e9319ec4a83ac4fabc88ae1705c2c64031']],
    },
  },
  'athena-money': {
    misrepresentedTokens: true,
    moonriver: {
      staking: { owners: ['0x1Dc0A29e51521E2e9262b91E6E78F4c15A4B7A1a'], tokens: ['0xBEcc61601c59d5aFFFCe750D201eC98CdC70DB796'], lps: ['0xc89c09a04440b7952790969ef470f8215bce4804'], useDefaultCoreAssets: true },
      pool2: ['0x8E57FbcA4191Baf208AfdAe4E7b5591423427f38', ['0xc881c93ebb075b3c80f16bc9e513a7784f794ef9', '0xc89c09a04440b7952790969ef470f8215bce4804']],
    },
  },
  'snowtomb': {
    misrepresentedTokens: true,
    avax: {
      staking: { owners: ['0x831B2Ab0f6f190536f4138Db00b03C3Bb1b5f12A'], tokens: ['0x924157B5dbB387A823719916B25256410a4Ad470'], lps: ['0x04fc1cec422792c2ca41671a24184834b433fc18'], useDefaultCoreAssets: true },
      pool2: ['0xb762Ece3Bc3571376BE73D2e6F3bBf4d108ED8b1', ['0x75adad64d0cc5f7ec4b0b1dc078f7d8c5b24056f', '0x04fc1cec422792c2ca41671a24184834b433fc18']],
    },
  },
  'ampere': {
    methodology: "Pool2 deposits consist of AMP/FUSE and CURRENT/FUSE LP tokens deposits while the staking TVL consists of the CURRENT tokens locked within the Masonry contract, priced using Fuse on Ethereum mainnet.",
    start: 1650700800,
    fuse: {
      staking: { owners: ['0x335c392db4f0ad43f782b0646959e41fc1134350'], tokens: ['0x3b1292fef70c3f9fb933dd2e2f4b734dcb35648d'], lps: ['0xaa33219a463635097fa8d603e5436ad08dd948fc'], useDefaultCoreAssets: true },
      pool2: ['0x8cdc3584b455b49634b9272247ad2acceef58c98', ['0x48515f859e44161bf67ae610a7c83f53b0048713', '0xaa33219a463635097fa8d603e5436ad08dd948fc']],
    },
  },
  'thermes-finance': {
    fantom: {
      staking: { owners: ['0x254033dA5000E3007d60A10466465EBf122e1851'], tokens: ['0x158521Ab22A4e22f01E6F2d3717cA85341dc694A'], lps: ['0xac4fa4dBb84932E7377229444f63e06E855Bb2F6'], useDefaultCoreAssets: true },
      pool2: ['0xf29F50Be3cD4F1a3960bf71B41302e2eC6c8eFe4', ['0x50E880EA5403283e31cb65da7b549a381b8C69C8', '0xac4fa4dBb84932E7377229444f63e06E855Bb2F6']],
    },
  },
  'rubik-finance': {
    fantom: {
      staking: { owners: ['0x7617Ca396262B4Ada6c13a42c9e1BA0AEED11996'], tokens: ['0xf619d97e6ab59e0b51a2154ba244d2e8157223fe'], lps: ['0xCb2534b86fDc053FA312745c281E0838f210e869'], useDefaultCoreAssets: true },
      pool2: ['0xf6b082B2ab9F4b17d2015F82342C3CA2843d524D', ['0x9f4cbfa5B43252f3eD06f35C3f1A1D14C36bCeF0', '0xCb2534b86fDc053FA312745c281E0838f210e869']],
    },
  },
  'ripae': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0x704115B8200392f2855B400bf0E414F3C8c3A472'], tokens: ['0x8a41f13a4fae75ca88b1ee726ee9d52b148b0498'], lps: ['0x2dc234dbfc085ddbc36a6eacc061d7333cd397b0'], useDefaultCoreAssets: true },
      pool2: ['0xa058316Af6275137B3450C9C9A4022dE6482BaC2', ['0x9ce8e9b090e8af873e793e0b78c484076f8ceece', '0x2dc234dbfc085ddbc36a6eacc061d7333cd397b0']],
    },
    avax: {
      staking: { owners: ['0xf5e49b0a960459799F1E9b3f313dFA81D2CE553c'], tokens: ['0x9466Ab927611725B9AF76b9F31B2F879Ff14233d'], lps: ['0x6139361Ccd4f40abF3d5D22AA3b72A195010F9AB'], useDefaultCoreAssets: true },
      pool2: ['0xb5cc0Ed74dde9F26fBfFCe08FF78227F4Fa86029', ['0x1179E6AF2794fA9d39316951e868772F96230375', '0x6139361Ccd4f40abF3d5D22AA3b72A195010F9AB']],
    },
    bsc: {
      staking: { owners: ['0x9Fb5Ee9D3ACebCCa39F69d6A2aa60fd8eAfA88B6'], tokens: ['0x6c7fc3Fd4a9f1Cfa2a69B83F92b9DA7EC26240A2'], lps: ['0x8eA4875469e8Fd7ad3790b4c7DEeF768ca1e806f'], useDefaultCoreAssets: true },
      pool2: ['0x18A5aefA5a6B20FeEeF0a3AabF876c813b04dB3d', ['0xC7DC9343C90Be0Ea2af6776EFe5e19B2734F8D0d', '0x8eA4875469e8Fd7ad3790b4c7DEeF768ca1e806f']],
    },
    polygon: {
      staking: { owners: ['0x4f1437a43500B7863c614528e6A15b220904010B'], tokens: ['0x8063037ea50E4a066bF1430EA1E3e609CD5cEf6B'], lps: ['0x07D53b147eF96FAD1896D1156755A9Da7E06098E'], useDefaultCoreAssets: true },
      pool2: ['0xa4dC4c7624acE1b415e6D937E694047b517F2D99', ['0x05eFa0Ed56DDdB4E950E3F5a54e349A137d4edC9', '0x07D53b147eF96FAD1896D1156755A9Da7E06098E']],
    },
    cronos: {
      staking: { owners: ['0xf5e49b0a960459799F1E9b3f313dFA81D2CE553c'], tokens: ['0xA01fAe0612a4786ec296Be7f87b292F05c68186B'], lps: ['0xBa11E930e37721c91ea55fAA7BC2EcEfA05D1436'], useDefaultCoreAssets: true },
      pool2: ['0x83EA9d8748A7AD9f2F12B2A2F7a45CE47A862ac9', ['0xB0dC8B777DD82a951D688f8E5Dc4EBcB42D57C75', '0xBa11E930e37721c91ea55fAA7BC2EcEfA05D1436']],
    },
    arbitrum: {
      staking: { owners: ['0x74C76108cE9555475A504A2A4A28d3Ba3354E89A'], tokens: ['0x83EA9d8748A7AD9f2F12B2A2F7a45CE47A862ac9'], lps: ['0x89A3A5b03f705A10443fB0A93f19F6cBB7ca191A'], useDefaultCoreAssets: true },
      pool2: ['0x4d1D896FD501788d8605f672AD72fC05Fe5ab311', ['0xB54B196E9FeCcF364c2281da1E11BC498cB5c1C1', '0x89A3A5b03f705A10443fB0A93f19F6cBB7ca191A']],
    },
    optimism: {
      staking: { owners: ['0x95F73Fc89F62b42410fC4A4a60edEfC51De0B7B0'], tokens: ['0x09448876068907827ec15f49a8f1a58c70b04d45'], lps: ['0x9629a694C041f3b10cE974DC37eF4dD4596c4F54'], useDefaultCoreAssets: true },
      pool2: ['0xf5e49b0a960459799F1E9b3f313dFA81D2CE553c', ['0x20d33fF7880f65a3554bBEE9C4E9BF79812C6ef6', '0x9629a694C041f3b10cE974DC37eF4dD4596c4F54']],
    },
  },
  'pulsemaxfinance': {
    misrepresentedTokens: true,
    pulse: {
      staking: { owners: ['0x4c5c8fD88Ba0709949e3C5Be3502500112Cd026c'], tokens: ['0xbc57572Ba711C8077222142C3374acE7B0c92231'], lps: ['0x32D1D76bA3df143C7258d933dAfB048f137c42BA'], useDefaultCoreAssets: true },
      pool2: ['0xEb8A0191Fa31F7aCEDeDe618246f7f7f907139bA', ['0x32D1D76bA3df143C7258d933dAfB048f137c42BA', '0x0edC492E29Ce7bEd4c71f83513E435f5d81cDEF9', '0x99B45b6f0Dd06866C955207c96431cDA2DA1d34b']],
    },
  },
  'polar-bear-finance': {
    avax: {
      staking: { owners: ['0xDC2b2C59eF33dA8E603d9F7B996DcDa3CD4CB6cd'], tokens: ['0x5B2Cf2d63299a473293577CF22a5241Fb0e8e1b2'], lps: ['0x1610C07565A2CfFf2809193A410Fb4EAAceAB378'], useDefaultCoreAssets: true },
      pool2: ['0x5b892d99BC94de7983fF156e5Ef917d7bC1a1690', ['0x84895C6279E50C584CEbEd4963672F730b448df0', '0x1610C07565A2CfFf2809193A410Fb4EAAceAB378']],
    },
  },
  'platinum-finance': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0x78996E5F9F486D44f74a6896fDD8D7e21780d86a'], tokens: ['0x32D50718bB7813C248ff4891d307EaB6964e965e'], lps: ['0x7abcbf6e6f6e2e70065a2bc71b11892327ea5343'], useDefaultCoreAssets: true },
      pool2: ['0xe39735d9741cbf0b8824a196a5bcb3d729153702', ['0x9ef3a25c3993a242c229a22c8ab5b3376809137e', '0x7abcbf6e6f6e2e70065a2bc71b11892327ea5343']],
    },
  },
  'peakmetis': {
    misrepresentedTokens: true,
    metis: {
      staking: { owners: ['0x9a03e23954578A63791581aed74cE1948871755e'], tokens: ['0x259EF6776648500D7F1A8aBA3651E38b1121e65e'], lps: ['0x9F881c2a9cF0ff6639A346b30AB6E663071Cb4C1'], useDefaultCoreAssets: true },
      pool2: ['0x2115686293c2096383A58713086276FAa6E09628', ['0x603e67714A1b910DCCFDcae86dbeC9467de16f4c', '0x9F881c2a9cF0ff6639A346b30AB6E663071Cb4C1']],
    },
  },
  'magik-finance': {
    misrepresentedTokens: true,
    fantom: {
      staking: { owners: ['0xac55a55676657d793d965ffa1ccc550b95535634'], tokens: ['0xc8ca9026ad0882133ef126824f6852567c571a4e'], lps: ['0x392c85ceccf9855986b0044a365a5532aec6fa31'], useDefaultCoreAssets: true },
      pool2: ['0x38f006eb9c6778d02351fbd5966f829e7c4445d7', ['0xdc71a6160322ad78dab0abb47c7a581cfe9709ee', '0x392c85ceccf9855986b0044a365a5532aec6fa31']],
    },
  },
  'icecream-finance': {
    avax: {
      staking: { owners: ['0x13692700791BD876D8f68b5df910339312Efc14b'], tokens: ['0x155f794b56353533E0AfBF76e1B1FC57DFAd5Bd7'], lps: ['0xbd61dfad83fc19960476abca1324ffd798234c66'], useDefaultCoreAssets: true },
      pool2: ['0x6CD5a7Acbe8Ddc57C8aC2EE72f3f957e26D81f51', ['0x00c87ce7188f7652d0c0940274cec5db62f1e825', '0xbd61dfad83fc19960476abca1324ffd798234c66', '0xec1e129bbaac3dde156643f5d41fc9b5a59033a7']],
    },
  },
  'comet-finance': {
    fantom: {
      staking: { owners: ['0xA68a020fd0B68A0e4E3F4a97dD44EE3aa0280E7f'], tokens: ['0xBAFDCFC3787BF7833BE6Be8E2D9e822B610255C9'], lps: ['0x6F5CA58FBd1B2f335d1B9489216490fBEDcAda7e'], useDefaultCoreAssets: true },
      pool2: ['0x9C8C8EB95749dEE9E8cC68f3cAaa658Ea6D1E4bd', ['0x06378DFab4d97ba1f67EbE68c94893e7fDDf9169', '0x6F5CA58FBd1B2f335d1B9489216490fBEDcAda7e']],
    },
  },
  'code7': {
    fantom: {
      staking: { owners: ['0x39990bf6889ec7481ed021c11210b09d29c1c2ea'], tokens: ['0xB215014176720EdA5334df07f827c3f11ec0f1bD'], lps: ['0x25d6e427e0db1594156f1d4f334f62184555332e'], useDefaultCoreAssets: true },
      pool2: ['0x42cd7c105cdc5c85d2ba1e57f7c74cb96f95e549', ['0x25d6e427e0db1594156f1d4f334f62184555332e', '0xd4996a8654cf4cd319fc82e70430e4704f6e55d5']],
    },
  },
  'amesdefi': {
    bsc: {
      staking: { owners: ['0xC183b26Ad8C660AFa7B388067Fd18c1Fb28f1bB4'], tokens: ['0xFa4b16b0f63F5A6D0651592620D585D308F749A4'], lps: ['0x91da56569559b0629f076dE73C05696e34Ee05c1'], useDefaultCoreAssets: true },
      pool2: ['0x1da194F8baf85175519D92322a06b46A2638A530', ['0x81722a6457e1825050B999548a35E30d9f11dB5c', '0x91da56569559b0629f076dE73C05696e34Ee05c1']],
    },
  },
  'droplit-money': {
    misrepresentedTokens: true,
    bsc: {
      staking: { owners: ['0x9D76Db596D281897F3ce842475b7BD6Ea2580b4b'], tokens: ['0x5Abf65C1d152244c6Bd4ad0a5eB92DB00e403BdB'], lps: ['0xa1E137dED898058af3a09caC599D50D1D3ac0ABc'], useDefaultCoreAssets: true },
      pool2: ['0x79D7c1a12c4dE91C487A87602478C5bc19b3aa7c', ['0xa1E137dED898058af3a09caC599D50D1D3ac0ABc', '0x4F8b3ee2421cac4743356e8207209eFf34B51ebe', '0x851b0a2514A56dD780480ab47268794E3d3D947D', '0x7661D626b4c588157960724528a8f3C4a1de5F36']],
    },
  },

  // ============================================================
  // Tomb forks (unknownTombs) - object staking + array pool2
  // ============================================================

  'empyreal': {
    misrepresentedTokens: true,
    arbitrum: {
      staking: { owners: ['0x71d2009460383c970c08b0e37cc8f029bce5bbcd'], tokens: ['0x368F6d735F3Fc8Aa0568D2B7aB275cB828B79709'], lps: ['0x87e65159edafae4bb1ccd0c94c7ec9427409b370', '0x06675843400F2267060ee886C9088fF498f7c8eC', '0x400ebc22c31bedcdab38a6b27963912df71840ed'], useDefaultCoreAssets: true },
      pool2: ['0x15084E92785027D4D4918CAbfa11281fC15bF9AC', ['0x87e65159edafae4bb1ccd0c94c7ec9427409b370', '0x06675843400F2267060ee886C9088fF498f7c8eC', '0x400ebc22c31bedcdab38a6b27963912df71840ed']],
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
      staking: { owners: ['0x83641aa58e362a4554e10ad1d120bf410e15ca90', '0x670433FB874d4B7b94CF1D16E95fa241474E6787'], tokens: ['0x56EbFC2F3873853d799C155AF9bE9Cb8506b7817', '0xFfF54fcdFc0E4357be9577D8BC2B4579ce9D5C88'], lps: ['0x168e509FE5aae456cDcAC39bEb6Fd56B6cb8912e', '0xF69FCB51A13D4Ca8A58d5a8D964e7ae5d9Ca8594'], useDefaultCoreAssets: true },
      pool2: ['0x820c3b6d408Cff08C8a31C9F1461869097ba047c', ['0x168e509FE5aae456cDcAC39bEb6Fd56B6cb8912e', '0xF69FCB51A13D4Ca8A58d5a8D964e7ae5d9Ca8594']],
    },
  },
  'dawn-star-finance': {
    misrepresentedTokens: true,
    polygon: {
      staking: { owners: ['0x00c8Ee42761C95B223676d6Ea59c6b7f6f643A6E'], tokens: ['0xf8Eed914a0BAcAF30C13420989bB7C81b75D833A'], lps: ['0xfc48B66b9119f1d5fD7C8e72E7e489a5D6C0EF55', '0xe1628A0e5250Fa17271Cef1ED4d892cb32D5ADd4'], useDefaultCoreAssets: true },
      pool2: ['0xfA9f91a340e2eFA47B67921f8809E98796d1f7F7', ['0xfc48B66b9119f1d5fD7C8e72E7e489a5D6C0EF55', '0xe1628A0e5250Fa17271Cef1ED4d892cb32D5ADd4']],
    },
  },
  'cowaii-cash': {
    misrepresentedTokens: true,
    dogechain: {
      staking: { owners: ['0x0eD8cFA5Bd631263CFAb290E12e2559af1252Ed6'], tokens: ['0xc90163b8d53F319AbE68dd1d8ecC025c72eB3f04'], lps: ['0x517ae0a15932A57D27cE26AE97f5F9Dbc6823907', '0x2b779C9Ed23bb315911EEE910bc3FfAbFfB776bB'], useDefaultCoreAssets: true },
      pool2: ['0xb015d1D4F846D44A699F5648071496D1eC99C4C5', ['0x517ae0a15932A57D27cE26AE97f5F9Dbc6823907', '0x2b779C9Ed23bb315911EEE910bc3FfAbFfB776bB']],
    },
  },
  'ora-finance': {
    misrepresentedTokens: true,
    methodology: "Pool2 deposits consist of ORA/AURORA and OSHARE/AURORA LP tokens deposits while the staking TVL consists of the OSHARES tokens locked within the Boardroom.",
    aurora: {
      staking: { owners: ['0xCF0c385aE8225EFF591bA4a7637cF688Bf012A16'], tokens: ['0xdcefBd8f92683541e428DD53Cd31356f38d69CaA'], lps: ['0x1203f76D98c103DFDa350C0b7F7323475Ee24aE3', '0x7939e155b222c804FCDd0d0297922BBEf6F64897'], useDefaultCoreAssets: true },
      pool2: ['0xa18d290144C684349b1Cc4fC8501707cd7724f74', ['0x1203f76D98c103DFDa350C0b7F7323475Ee24aE3', '0x7939e155b222c804FCDd0d0297922BBEf6F64897']],
    },
  },
}

module.exports = buildProtocolExports(configs, stakingOnlyExportFn)
