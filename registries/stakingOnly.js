const ADDRESSES = require('../projects/helper/coreAssets.json')
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
  'solvr': {
    methodology: 'TVL is calculated as the total SOLVR tokens staked in the SolvrStaking contract on Base.',
    base: { 
      staking: ["0xde2dc52d8ac7b793a9558b7b13b7b24f5c3b983a", "0x6DfB7BFA06e7c2B6c20C22c0afb44852C201eB07"]
    }
  },
  'nickel': {
    methodology: 'TVL is NICKEL tokens held in GridMining (mined rewards) and Staking (user-staked NICKEL).',
    base: { 
      staking: { owners: ["0xEF35314a4F3a1F8CE89095202dABAeEe1CaAd760", "0x93CF815EC397C526576078A74197c3fa2d769b80"], tokens: ['0xe11b4DD87675B52980b3427029a2d792A4A05aa2']}
    }
  },
  'bitchemical': {
    methodology: 'Counts BCHEM held by the Bitchemical staking contract on BNB Chain.',
    bsc: {
      staking: ['0x01F82039810f18F703F4c8b943940ce04Fa00C78', '0x9102E0A76a5e2823073Ed763a32Ba8ca8521b1F3']
    }
  },
  'mineloot': {
    methodology: 'TVL is LOOT tokens held in GridMining (mined rewards), Staking (user-staked LOOT), and Lock (user-locked LOOT).',
    base: {
      staking: { owners: ['0xA8E2F506aDcbBF18733A9F0f32e3D70b1A34d723', '0xbb9D524e28c7E7b5A9D439D5D1ba68A87788BbB6', '0x554CEAe7b091b21DdAeFe65cF79651132Ee84Ed7'], tokens: ['0x00E701Eff4f9Dc647f1510f835C5d1ee7E41D28f']}
    }
  },
  'cronos-gangsters': {
    methodology: 'TVL counts GANG tokens locked in Cronos Gangsters staking and competition contracts.',
    cronos: {
      staking: { owners: ['0x2099ad49329909FDb620714D01F5A74D57CDeE0C', '0xe546C82f0CedE3341dC402626923A6D4b95234Ee'], tokens: ['0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF']}
    }
  },
  'reppo': {
    methodology: 'TVL is the total REPPO tokens locked in the VeREPPO contract.',
    base: {
      staking: { owners: ['0x0EFBE19Cb7B07D934D01990a8989E9CaA98b9009'], tokens: ['0xFf8104251E7761163faC3211eF5583FB3F8583d6']}
    }
  },
  'nara': {
    methodology: 'TVL is the total NARA locked in NARAEngineV2. Users lock NARA for a chosen duration and earn NARA + ETH rewards every 15-minute epoch.',
    base: {
      staking: { owners: ['0x62250aEE40F37e2eb2cd300E5a429d7096C8868F'], tokens: ['0xE444de61752bD13D1D37Ee59c31ef4e489bd727C']}
    }
  },
  'venice-protocol': {
    methodology: 'Counts the total VVV tokens locked in the Venice Protocol staking contract (sVVV) on Base.',
    base: {
      staking: ['0x321b7ff75154472B18EDb199033fF4D116F340Ff', '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf'],
    },
  },
  'velhalla': {
    velas: {
      staking: ['0x7DeD7f9D3dF541190F666FB6897483e46D54e948', '0x8d9fb713587174ee97e91866050c383b5cee6209'],
    },
  },
  'xrune': {
    methodology: 'TVL comes from the Staking Vaults and Launchpad Tiers',
    ethereum: {
      staking: [[
        '0x93f5dc8bc383bb5381a67a67516a163d1e56012a',
        '0x2a092e401507dD4877cCd0b4Ee70B769452DbB7a',
        '0xc20434f595c32B5297A737Cb173382Dd2485C2cC',
        '0x8ba0C510Da4507D1F5f73ff9E1FcD14Edc819EB2',
        '0x817ba0ecafD58460bC215316a7831220BFF11C80',
      ], '0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c'],
    },
  },
  'zeepr': {
    arbitrum: {
      staking: ['0xbb0390cf2586e9b0a4faadf720ae188d140e9fd5', '0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13'],
    },
    core: {
      staking: ['0x60101E4388D1c2B389d78daC29d37Ee2DAc88e07', ['0x1281E326C6e4413A98DafBd0D174a4Ae07ff4223', ADDRESSES.core.WCORE]],
    },
    bsc: {
      staking: ['0x096e9A8B7137bEBA3A043b800D3d227d5abB077a', '0x55CBAC75C1af769eB7FD37d27A5cb6437EB29abB'],
    },
    manta: {
      staking: ['0x37D8A51d9621041d6b9276ea8a835553b31698c7', '0x0863C7BcdB6Cf6edd5dc4bbd181A8D555AedbfBd'],
    },
    polygon: {
      staking: ['0xCb9A02B704640ffcf43D6a8DAe5096fc8a44021c', '0x49fdEA2192b04e54E6D1cB5E3B3b996BAA6f621F'],
    },
    zkfair: {
      staking: ['0x37D8A51d9621041d6b9276ea8a835553b31698c7', '0x5d26DeA980716e4aBa19F5B73Eb3DCcE1889F042'],
    },
  },
  'velaspad': {
    velas: {
      staking: ['0xdb0422A1C78C2064Ce5Af1B75412294F5B6D7Edf', '0xa065e0858417dfc7abc6f2bd4d0185332475c180'],
    },
  },
  'arcx': {
    methodology: 'ARCx can be staked in the protocol',
    ethereum: {
      staking: ['0x9bffad7a6d5f52dbc51cae33e419793c72fd7d9d', '0x1321f1f1aa541a56c31682c57b80ecfccd9bb288'],
    },
  },
  'dracula': {
    hallmarks: [
      ['2022-03-17', 'DRACULA is for now fully focused on it\'s Metaverse product'],
    ],
    methodology: 'Tokens staked on 0xC8DFD57E82657f1e7EdEc5A9aA4906230C29A62A',
    ethereum: {
      staking: ['0xC8DFD57E82657f1e7EdEc5A9aA4906230C29A62A', '0xb78b3320493a4efaa1028130c5ba26f0b6085ef8'],
    },
  },
  'snowbank': {
    methodology: 'Counts tokens on the treasury for tvl and staked SB for staking',
    avax: {
      staking: ['0x85784d5e2CCae89Bcb39EbF0ac6Cdc93d42d99AD', '0x7d1232b90d3f809a54eeaeebc639c62df8a8942f'],
    },
  },
  'citrea-staking': {
    methodology: 'Sum of CTR locked by users in the xCTR (Staked CTR) staking contract on Citrea, which grants governance voting power.',
    citrea: {
      staking: { owners: ['0x2015F35030A8Ff2C0CA161a865414996F8E80AA4'], tokens: ['0x547AfD93B9c47D552059FEb556909e017f8a9b25']},
    },
  },
  'tokamak-network': {
    methodology: 'TON staked through Tokamak Network seigniorage staking on Ethereum L1. Stakers delegate TON to operator (DAO candidate) contracts; the principal is custodied as WTON (27-decimal wrapped TON) in the DepositManager (0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e). Reported staking value is the DepositManager WTON balance.',
    ethereum: {
      staking: { owners: ['0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e'], tokens: ['0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2']},
    },
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
    deadFrom: '2026-01-19',
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
  'akropolis': {
    ethereum: {
      staking: ['0x3501Ec11d205fa249f2C42f5470e137b529b35D0', '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7'],
    },
  },
  'orbs': {
    ethereum: {
      staking: ['0x01d59af68e2dcb44e04c50e05f62e7043f2656c3', '0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA'],
    },
  },
  'looks-rare': {
    methodology: 'TVL for LOOKS.RARE consists of the staking of LOOKS and pool2 of uni-v2 LOOKS-WETH.',
    ethereum: {
      staking: ['0x465a790b428268196865a3ae2648481ad7e0d3b1', '0xf4d2888d29D722226FafA5d9B24F9164c092421E'],
      pool2: ['0x2a70e7f51f6cd40c3e9956aa964137668cbfadc5', '0xdc00ba87cc2d99468f7f34bc04cbf72e111a32f7'],
    },
  },
  'thegraph': {
    methodology: 'TVL counts GRT tokens deposited on the Staking contracts.',
    start: '2023-06-25',
    ethereum: {
      staking: ['0xF55041E37E12cD407ad00CE2910B8269B01263b9', '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'],
    },
    arbitrum: {
      staking: ['0x00669A4CF01450B64E8A2A20E9b1FCB71E61eF03', '0x9623063377AD1B27544C965cCd7342f7EA7e88C7'],
    },
  },
  'ethfi-stake': {
    ethereum: {
      staking: ['0x86B5780b606940Eb59A062aA85a07959518c0161', ADDRESSES.ethereum.ETHFI],
    },
    arbitrum: {
      staking: ['0x86B5780b606940Eb59A062aA85a07959518c0161', ADDRESSES.arbitrum.ETHFI],
    },
  },
  'epns': {
    methodology: 'TVL for PUSH consists of the staking of PUSH and pool2 of uni-v2 LP.',
    ethereum: {
      staking: ['0xb72ff1e675117bedeff05a7d0a472c3844cfec85', '0xf418588522d5dd018b425e472991e52ebbeeeeee'],
      pool2: ['0xb72ff1e675117bedeff05a7d0a472c3844cfec85', '0xaf31fd9c3b0350424bf96e551d2d1264d8466205'],
    },
  },
  'fees-wtf': {
    methodology: 'TVL for fees.wtf consists of the staking of WTF and pool2 of uni-v2 WTF-WETH.',
    ethereum: {
      staking: ['0x0bf0e1678eaa36cd2d705cab3ce8020de443056c', '0xA68Dd8cB83097765263AdAD881Af6eeD479c4a33'],
      pool2: ['0xf0c51dc9a85d00c1c1bebfbb2d1465a39f4702d8', '0xab293dce330b92aa52bc2a7cd3816edaa75f890b'],
    },
  },
  'gracy-staking': {
    ethereum: {
      staking: [[
        '0x76A2A3ebeCc73871cc24e4807C4cBA57D03b0b2c', '0xa0EE760C52b10d2A21E563526248CA389D9C47E6',
        '0xAb6aD663b42c7031b52737cbcBF9f70cb88fD9FC', '0x4f1043ABb51648E817b8e62EcABc157F91E61c52',
        '0x6e05d3a61f5026EEa67d0a82843d5E82eb3E2608', '0xE5ff1432DC7BE35CC73216A8cc468608398AD433',
        '0x908c41C339DAAaC0be4440ba2CFbA4fFb0093a4A', '0x2D5D48c72222DDdAE37317aa03a6BC5a5734f028',
      ], '0x7c95e7ad2b349dc2f82d0f1117a44b561fa2699a'],
    },
    base: {
      staking: [['0xE63F62Ba055003aEDB394Dc3e7056fAF49bf97b1'], '0xc5449Fafc8711B6fa68192586c9Aa9302503b939'],
    },
  },
  'heroes-of-mavia': {
    ethereum: {
      staking: ['0xF2f8D915a4F28Cdb52cbe8F56ecc0f8AE3def54A', '0x24fcFC492C1393274B6bcd568ac9e225BEc93584'],
    },
    base: {
      staking: [['0x21890f88fc8A8b0142025935415017adA358C8C0', '0xecc312CBDC0884C41FE1579ea33686DdAcc90c42'], '0x24fcFC492C1393274B6bcd568ac9e225BEc93584'],
    },
  },

  // ============================================================
  // Bulk-migrated empty-tvl staking/pool2 adapters
  // ============================================================

  "the-sandbox": {
    "methodology": "SAND LP on quickswap and uniswap-v2 can be staked as pool2 - only component of the Sandbox TVL at the moment",
    "polygon": {
      pool2: ["0x4ab071c42c28c4858c4bac171f06b13586b20f30","0x369582d2010b6ed950b571f4101e3bb9b554876f"],
    },
    "ethereum": {
      pool2: ["0xeae6fd7d8c1740f3f1b03e9a5c35793cd260b9a6","0x3dd49f67E9d5Bc4C5E6634b3F70BfD9dc1b6BD74"],
    },
  },
  "retreeb": {
    "fantom": {
      staking: [["0x669b6723D8cf1cE664bc1005646a26Dc8563E5C7","0x39985D64b122f9089340CF1ab39D756e3cA74F0f","0x5fA057966fB12c9e89bF603661CE3133bD3CBf8B","0x5C6f3A0d2a8A921Fa473a22C71a84504b43c0DA6","0xB767C1fAcA04DD9eaBE20e307C52E81c37Bfb1a1","0x326b7cCcBA7370fAd44a7CE82bee71B6504576B0","0x6A45918D754b167d3E492A10A6DDf81e6C24E455","0xbBC2BBd0335d0c60160E9b3fb7102602510EAc03","0x2EE9261F7A4226FeC96B2a0c64c0613bf5367A12"],"0xc60d7067dfbc6f2caf30523a064f416a5af52963"],
    },
  },
  "championfinance": {
    "avax": {
      staking: [["0x2d1a3d4D070B469C84E92d01dB0f94F1159Dbf3e","0x6001Ca31953459704ba7eA44A9387f68B4f1B639","0xa23a7Ca585d4651F1cf6277Cd29f5D7D344441e8"],"0xc65bC1E906771e105fBAcBD8dfE3862Ee7BE378E"],
      pool2: ["0x649EfBF7D96B06a2bD0fB134621AC9dD031923A4",["0x7748456409D4Eee3FaCE6aD0c492DD9853A1CC3d","0xd6F18CDe9A52A9D815dd3C03C2325D453E32BDef","0x8392a728aEe00a26E99AF8e837c33591944e033a"]],
    },
  },
  "cortexdao": {
    "hallmarks": [["2022-05-07","UST depeg"],["2023-03-11","USDC depeg"]],
    "ethereum": {
      staking: ["0x6021D8e7537d68bCEC9A438b2C134c24Cbcc1ce3","0x5a56da75c50aa2733f5fa9a2442aaefcbc60b2e6"],
    },
  },
  "hermes-finance": {
    "avax": {
      staking: ["0x02662d2079a3218275bdA1Adf812ab5e324a5b27","0xfa4b6db72a650601e7bd50a0a9f537c9e98311b2"],
      pool2: ["0xDDd0A62D8e5AFeccFB334e49D27a57713DD0fBcc",["0xc58cc1a0f29f1993d089681e4fa03c7f65df1325","0xC132ff3813De33356C859979501fB212673e395e"],"avax"],
    },
  },
  "tornadocore": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2 only",
    "ethereum": {
      staking: ["0x42A43cD4A19eaBE7775Ea261e4ECAC4CBC2acC3a","0x7A3D5d49D64E57DBd6FBB21dF7202bD3EE7A2253"],
      pool2: ["0x42A43cD4A19eaBE7775Ea261e4ECAC4CBC2acC3a","0x39C0eDEf530d284b8f7820061114157C5bD78093"],
    },
    "bsc": {
      staking: [["0x8BE19596c251c6A3d4b490d065F230054e018E21","0xbb9FAe76E20683923dfFfAC0f02f03a07e13FbCA"],"0x40318becc7106364D6C41981956423a7058b7455"],
      pool2: [["0x8BE19596c251c6A3d4b490d065F230054e018E21","0xbb9FAe76E20683923dfFfAC0f02f03a07e13FbCA"],["0x4Ad7b83AdDAc8146ae43eAaAc8051C3aA0587a87","0x05a509E620869227396E9fb82365D6b418C05eb6"],"bsc"],
    },
    "polygon": {
      staking: ["0x40318becc7106364D6C41981956423a7058b7455","0x4CC5205b9523Fc40E99C20AC7B8Ba0B606c3dbCe"],
      pool2: ["0x40318becc7106364D6C41981956423a7058b7455","0xa109Bae20e8c6bdf84E44B45857e81ad05c8A129","polygon"],
    },
  },
  "treasuredao": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2 only",
    "arbitrum": {
      staking: ["0xA0A89db1C899c49F98E6326b764BAFcf167fC2CE","0x539bdE0d7Dbd336b79148AA742883198BBF60342"],
      pool2: ["0x73EB8b2b235F7957f830ea66ABE433D9EED9f0E3","0xB7E50106A5bd3Cf21AF210A755F9C8740890A8c9"],
    },
  },
  "umbria": {
    "ethereum": {
      staking: ["0xdF9401225cC62d474C559E9c4558Fb193137bCEB","0xa4bbe66f151b22b167127c770016b15ff97dd35c"],
      pool2: ["0xdF9401225cC62d474C559E9c4558Fb193137bCEB","0xA76aE94659B6B53c5e85D37fBDd36aDCb7635b23"],
    },
    "polygon": {
      staking: ["0x3756a26De28d6981075a2CD793F89e4Dc5A0dE04","0x2e4b0fb46a46c90cb410fe676f24e466753b469f"],
      pool2: ["0x3756a26De28d6981075a2CD793F89e4Dc5A0dE04","0x9c8c16cd2a7a695ae30920ee4c3f558893665c55"],
    },
  },
  "earnm": {
    "arbitrum": {
      staking: ["0xA9F4ee72439afC704db48dc049CbFb7E914aD300","0x3e62fED35c97145e6B445704B8CE74B2544776A9"],
    },
  },
  "arbius": {
    "misrepresentedTokens": false,
    "methodology": "Counts staked $AIUS in the voting escrow contract",
    "arbitrum": {
      staking: [["0x3A7e6915f997Cdbc8BFB090051AA22E37Dab345d"],"0x4a24B101728e07A52053c13FB4dB2BcF490CAbc3"],
    },
  },
  "basedai": {
    "methodology": "Currently, the TVL is considered as the amount of Pepecoin tokens held in the farming contract at '0xa6b816010ab51e088c4f19c71aba87e54b422e14'.",
    "ethereum": {
      staking: ["0xa6b816010ab51e088c4f19c71aba87e54b422e14","0xA9E8aCf069C58aEc8825542845Fd754e41a9489A"],
    },
  },
  "pdollar": {
    "methodology": "Pool2 deposits consist of PDO/DAI and sPDO/DAI LP tokens deposits while the staking TVL consists of the sPDO tokens locked within the Boardroom contract(0x82D868D99747fbF9FDff367Bb9f1c55112B05c7F).",
    "fantom": {
      staking: ["0x82D868D99747fbF9FDff367Bb9f1c55112B05c7F","0x1D3918043d22de2D799a4d80f72Efd50Db90B5Af"],
      pool2: ["0xe8E0f521433028718baa338467151A3D43974292",["0xd339d12C6096Cb8E16a2BcCB5ACacA362bE78EA7","0x5FBbd691e7d998fe6D5059B9BFa841223c018c31"]],
    },
  },
  "neuralai": {
    "ethereum": {
      staking: ["0xbe2cf8DA9887e2AB997Ed53cC49263eBD09B20C3",["0x32B053F2CBA79F80ada5078cb6b305da92BDe6e1","0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44"]],
    },
  },
  "thorfi": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on pool2 only",
    "avax": {
      pool2: ["0xd003A09719D45DB83C07872e18Bc3e1a69B4824a","0x95189f25b4609120F72783E883640216E92732DA"],
    },
  },
  "chargedefi": {
    "methodology": "The TVL of Charge Defi is calculated using the Pancake LP token deposits (Static/BUSD and Charge/BUSD) in the farms, and the Charge & Static-BUSD deposits found in each Boardroom.",
    "bsc": {
      staking: ["0x53D55291c12EF31b3f986102933177815DB72b3A","0x1C6bc8e962427dEb4106aE06A7fA2d715687395c"],
      pool2: ["0xA1Be11eAB62283E9719021aCB49400F6d5918153",["0xB73b4eeb4c4912C1d1869219A22660eB478B57eA"]],
    },
  },
  "houdiniswap": {
    "hallmarks": [["2025-11-10","Staking program discontinued"],["2026-04-17","Buyback and burn discontinued"],["2026-05-04","Acquired by SOL strategies"]],
    "ethereum": {
      staking: ["0x4401c51110e7d3a970Fe48AeaeE8249b181210a1","0x922D8563631B03C2c4cf817f4d18f6883AbA0109"],
    },
  },
  "arable-protocol": {
    "avax": {
      staking: ["0x4bc722Cd3F7b29ae3A5e0a17a61b72Ea5020502B","0x00ee200df31b869a321b10400da10b561f3ee60d"],
      pool2: ["0x598EBAC38cF211749b1277c9a34d217226A476Af",["0x64694FC8dFCA286bF1A15b0903FAC98217dC3AD7"],"avax"],
    },
  },
  "flexdao": {
    "methodology": "Counting all FLEX tokens staked in the DAO",
    "smartbch": {
      staking: ["0xA9bB3b5334347F9a56bebb3f590E8dF97fC091f9","0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3","smartbch","flex-coin",18],
    },
  },
  "trust-wallet": {
    "methodology": "TVL counts TWT tokens deposited on the Staking contracts.",
    "bsc": {
      staking: ["0x5029f49585D57ed770D2194841B5A0bE06BFc2ED","0x4b0f1812e5df2a09796481ff14017e6005508003"],
    },
  },
  "neotokyo": {
    "ethereum": {
      staking: ["0x67e1eCFA9232E27EAf3133B968A33A9a0dCa9e16","0xa19f5264F7D7Be11c451C093D8f92592820Bea86"],
    },
  },
  "ovr": {
    "methodology": "We count the tokens locked in the staking contract, the tokens in the IBCO reserve, and the tokens locked in vesting.",
    "ethereum": {
      staking: [["0xc947FA28527A06cEE53614E1b77620C1b7D3A75D","0xCa0F390C044FD43b1F38B9D2A02e06b13B65FA48"],"0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697"],
      vesting: [["0xcee8fcbc9676a08b0a048180d99b41a7f080bb78","0xe6984300afd314A2F49A5869e773883CdfAe49C2"],"0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697"],
    },
    "polygon": {
      staking: [["0x7e98b560eFa48d8d04292EaF680E693F6EEfB534","0x671F928505C108E49c006fb97066CFdAB34a2898"],"0x1631244689EC1fEcbDD22fb5916E920dFC9b8D30"],
    },
  },
  "axl-inu": {
    "methodology": "TVL only counts liquidity in the staking pools.",
    "bsc": {
      staking: [["0xd500a6652365E819888Aa4df72d79eE970dB9B42"],"0x25b24B3c47918b7962B3e49C4F468367F73CC0E0"],
    },
    "ethereum": {
      staking: [["0x440D1c47379CF17CCB7Eb334Ae80DC8291FB14Ad"],"0x25b24B3c47918b7962B3e49C4F468367F73CC0E0"],
    },
  },
  "metf-finance": {
    "cronos": {
      staking: ["0x1A6aD4bac521a98556A4C0Da5946654c5DC7Ce0A","0xb8df27c687c6af9afe845a2afad2d01e199f4878"],
      pool2: ["0xE25737b093626233877EC0777755c5c4081580be","0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7"],
    },
  },
  "marlinprotocol": {
    "arbitrum": {
      staking: ["0xf90490186F370f324DEF2871F077668455f65253","0xdA0a57B710768ae17941a9Fa33f8B720c8bD9ddD"],
    },
  },
  "iskra": {
    "klaytn": {
      staking: ["0xb30d86d84f5b2df67ef962be0c6cf4c39901d416","0x17d2628d30f8e9e966c9ba831c9b9b01ea8ea75c"],
    },
  },
  "ultra": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2 only",
    "bsc": {
      staking: ["0x69dC0B62b73B596Ced10710f799ECD6CBBC032f5","0x0b3f42481c228f70756dbfa0309d3ddc2a5e0f6a"],
      pool2: ["0x69dC0B62b73B596Ced10710f799ECD6CBBC032f5","0x48bAc97D5E3116626A56704BE7399E1Cb593A945"],
    },
  },
  "oninofarm": {
    "bsc": {
      staking: [["0x94c62870C8234F4DB1629e7378fBCA46402c34f8","0x415146A17F25ac2CC4c51E7b2bEEF9a6E32439a5","0xBCCd7c12f570676984CA66F70e2E98809C7F13c3","0x1b581E15421cE65888316939116139519a77dAAF","0xcCD9af13Aa5132e36dBE524DE6Acc26405209Da2"],"0xea89199344a492853502a7A699Cc4230854451B8"],
    },
  },
  "devve": {
    "methodology": "DEVVE can be staked in the protocol",
    "ethereum": {
      staking: ["0xa0dab5d6907a9CFFD023e0160210eAB464322b70","0x8248270620Aa532E4d64316017bE5E873E37cc09"],
    },
  },
  "everipedia": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking only",
    "ethereum": {
      staking: ["0x1bF5457eCAa14Ff63CC89EFd560E251e814E16Ba","0x579cea1889991f68acc35ff5c3dd0621ff29b0c9"],
    },
  },
  "sakai-vault": {
    "bsc": {
      staking: [["0xc20A079c7962D9fc92173cda349e80D484dFA42A","0xba94E7c2306aC3BE22C123041Fd7823d7fA15933","0xeEC3514a5A66432ff2887e44664b5a82db229e5F"],"0x43b35e89d15b91162dea1c51133c4c93bdd1c4af"],
    },
  },
  "dypius": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidity on the DYP staking contracts",
    "bsc": {
      staking: [["0x8cee06119fffecdd560ee83b26cccfe8e2fe6603"],"0x1a3264F2e7b1CFC6220ec9348d33cCF02Af7aaa4"],
    },
    "ethereum": {
      staking: [["0xC9075092Cc46E176B1F3c0D0EB8223F1e46555B0"],"0x39b46b212bdf15b42b166779b9d1787a68b9d0c3"],
    },
    "avax": {
      staking: [["0x8cee06119fffecdd560ee83b26cccfe8e2fe6603"],"0x1a3264F2e7b1CFC6220ec9348d33cCF02Af7aaa4"],
    },
  },
  "get-protocol": {
    "ethereum": {
      staking: ["0x3e49e9c890cd5b015a18ed76e7a4093f569f1a04","0x8a854288a5976036a725879164ca3e91d30c6a1b"],
    },
    "polygon": {
      staking: ["0x3e49e9c890cd5b015a18ed76e7a4093f569f1a04","0xdb725f82818De83e99F1dAc22A9b5B51d3d04DD4"],
    },
  },
  "quartzdefi": {
    "misrepresentedTokens": true,
    "harmony": {
      staking: [["0xe1e48d3476027af9dc92542b3a60f2d45a36e082","0x1da194F8baf85175519D92322a06b46A2638A530","0xCa1dd590C3ceBa9F57E05540B91AB3F0Ed08580a"],["0xb9E05B4C168B56F73940980aE6EF366354357009"]],
      pool2: ["0x1da194f8baf85175519d92322a06b46a2638a530",["0x3736b5b6f2033433ea974e121ce19cc6d0e10dc9","0x157e2e205b8d307501f1aad1c5c96c562e6f07c5","0x90a48cb3a724ef6f8e6240f4788559f6370b6925"]],
    },
    "bsc": {
      staking: ["0xC183b26Ad8C660AFa7B388067Fd18c1Fb28f1bB4","0xFa4b16b0f63F5A6D0651592620D585D308F749A4"],
      pool2: ["0x1da194F8baf85175519D92322a06b46A2638A530",["0x6f78a0d31adc7c9fb848850f9d2a40da5858ad03","0x39846550Ef3Cb8d06E3CFF52845dF42F71Ac3851","0x61503f74189074e8e793cc0827eae37798c2b8f7"]],
    },
  },
  "ispolink": {
    "methodology": "Counts the number of ISP tokens in the native Ispolink protocols.",
    "ethereum": {
      staking: ["0x8D28b93BfaA4adD716aC8B993e78c3844d8eB01A","0xc8807f0f5ba3fa45ffbdc66928d71c5289249014"],
    },
    "bsc": {
      staking: ["0xb6506E019CEF6d794c3304134B2b38a23090a0B0","0xd2e7b964770fcf51df088a5f0bb2d33a3c60cccf"],
    },
    "manta": {
      staking: ["0x4519cc4A5A43ef66eaBEE810f54E23f655C293Ed","0xBAb1c57ec0bB0aE81d948503E51d90166459D154"],
    },
  },
  "minebean": {
    "methodology": "TVL is BEAN tokens held in GridMining (mined rewards) and Staking (user-staked BEAN).",
    "base": {
      staking: [["0xfe177128Df8d336cAf99F787b72183D1E68Ff9c2","0x9632495bDb93FD6B0740Ab69cc6c71C9c01da4f0"],"0x5c72992b83E74c4D5200A8E8920fB946214a5A5D"],
    },
  },
  "capital-dao": {
    "methodology": "TVL includes all farms in staking and swap contract",
    "ethereum": {
      staking: ["0x0a6bfa6aaaef29cbb6c9e25961cc01849b5c97eb","0x3c48Ca59bf2699E51d4974d4B6D284AE52076e5e"],
      pool2: ["0x0a6bfa6aaaef29cbb6c9e25961cc01849b5c97eb","0x0be902716176d66364f1c2ecf25829a6d95c5bee"],
    },
  },
  "meritcircle": {
    "ethereum": {
      staking: [["0x5c76aD4764A4607cD57644faA937A8cA16729e39","0x74aDae862AdCCCF7a7DBF2f7B139AB56e6b0E79D"],"0x949d48eca67b17269629c7194f4b727d4ef9e5d6"],
      pool2: [["0x44c01e5e4216f3162538914d9c7f5E6A0d87820e","0xebE3CA21e37723E0bE0F519724798fe8EEfF83D1"],["0xcCb63225a7B19dcF66717e4d40C9A72B39331d61"]],
    },
  },
  "cryptovalley": {
    "blast": {
      staking: ["0x6b4e27661ea80f47b9a48331fe6d0260b1ecb28a","0x67fa2887914fa3729e9eed7630294fe124f417a0"],
    },
  },
  "hades-money": {
    "metis": {
      staking: ["0x686A9472B839e8601c81335D0B088b33082BC2f7","0xEfB15eF34f85632fd1D4C17FC130CcEe3D3D48aE"],
      pool2: ["0xcd66208ac05f75069C0f3a345ADf438FB3B53C1A",["0xCD1cc85DC7b4Deef34247CCB5d7C42A58039b1bA","0x586f616Bb811F1b0dFa953FBF6DE3569e7919752"],"metis"],
    },
  },
  "metastrike": {
    "methodology": "Total Value Lock in Metastrike protocol is calculated by sum of: Staking and Vesting locked value",
    "bsc": {
      staking: [["0x3668b1fbba7ea689901b5ab530401cc0134322c6","0xb5ec84087352463f21a7ec54d342319bb95bc351","0xEBc4691b9e28AaE15B5439352c9e50A7b6E76B79","0x49Ae88cc37fbcAcA51f412707BE81b933Cd4AD5e","0x38dcC010518E266372DD574fA74a03ccb38Fd30d","0x6C7EbB352F92003Aa767675a7a4062ca74206e19","0x05dE10e375b03e9072f4ac7b1166CCfee53E7003"],"0x496cC0b4ee12Aa2AC4c42E93067484e7Ff50294b"],
      vesting: [["0x8be5ee50f10a2ff7313b24cacfc21639bef48b60","0xfd9ea0e249293f9589e18d8ce8973ce985e90e52","0x37976466F68C7b74BeA901E49263F8C7E081d42D","0x263718B1DFECa8b49406FD4FD1aC5aFD05619d69","0x5573a696262362218331c9bA832315205D4289e0"],"0x496cC0b4ee12Aa2AC4c42E93067484e7Ff50294b"],
    },
  },
  "zeroswap": {
    "methodology": "Counts tvl of all the tokens staked through Staking Contracts",
    "ethereum": {
      staking: ["0xEDF822c90d62aC0557F8c4925725A2d6d6f17769","0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5"],
    },
    "bsc": {
      staking: ["0x593497878c33dd1f32098E3F4aE217773F803cf3","0x44754455564474A89358B2C2265883DF993b12F0"],
    },
    "polygon": {
      staking: ["0x89eA093C07f4FCc03AEBe8A1D5507c15dE88531f","0xfd4959c06fbcc02250952daebf8e0fb38cf9fd8c"],
    },
    "avax": {
      staking: ["0xa4751EAa89C5D6ff61384766268cabf25aCD1011","0x44754455564474A89358B2C2265883DF993b12F0"],
    },
  },
  "umbrella": {
    "methodology": "Counts liquidty on the staking pools (v1, v2 and v3) on Eth and BSC (https://staking.umb.network/)",
    "ethereum": {
      staking: [["0xDa9A63D77406faa09d265413F4E128B54b5057e0","0x5A2697C772d6062Eb2005e84547Ec4a36cCb3B52","0x2d9D79B3189377449aB2AA4bBD2cd2651e0b85BE"],"0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2"],
      pool2: [["0x885EbCF6C2918BEE4A2591dce76da70e724f9a8E","0xa67cbdAd80C34e50F5DE96730f658910f52b2F8c","0xB67D91E38fbA6CfCb693d3f4598F8bd1e6e68AE3"],"0xB1BbeEa2dA2905E6B0A30203aEf55c399C53D042"],
    },
    "bsc": {
      staking: [["0x1541A01c407dCf88f32659D2C4A21Bb5763Fd2B4","0x53Fa13Fa6c803d5fF6bDAe06bf6Bc12EdF1e343d","0x55881395d209397b0c00bCeBd88abC1386f7aBe7"],"0x846F52020749715F02AEf25b5d1d65e48945649D"],
      pool2: [["0x8c7e186ce08F1f2585193b1c10799F42966BD7FF","0xdCbcDb9bFAD7B0A08306aF10Aa11c3c3b6470921","0x6Ff6B943D20B611E81a581c1E7951A6Dc0AC3455"],"0xFfD8eEFb9F0Ba3C60282fd3E6567A2C78C994266"],
    },
  },
  "friendtech33": {
    "base": {
      staking: ["0x6F82D82e6FEcB6d0dAF08b8fFD9772d596582F4A","0x3347453Ced85bd288D783d85cDEC9b01Ab90f9D8"],
    },
  },
  "spartacadabra": {
    "methodology": "TVL account in Spartacadabra",
    "fantom": {
      staking: [["0x3e0c908de05193147e1278A3065b0784FeD80694","0xB7396019BC1Ee7E771155D138D57Ee9aBf16F5b4","0xf98237Ef6c9A4990496d38a374d0C1098E26719e","0x20dd72ed959b6147912c2e529f0a0c651c33c9ce"],"0x248CB87DDA803028dfeaD98101C9465A2fbdA0d4"],
    },
  },
  "mmo-finance": {
    "cronos": {
      staking: ["0x692db42F84bb6cE6A6eA62495c804C71aA6887A7","0x50c0c5bda591bc7e89a342a3ed672fb59b3c46a7"],
    },
  },
  "snsy": {
    "methodology": "Counts the number of SNSY tokens in the Staking contract.",
    "ethereum": {
      staking: ["0x382c70620e42c2EF2b303b97bad1d9439Bf48ef9","0x82a605D6D9114F4Ad6D5Ee461027477EeED31E34"],
    },
  },
  "superlauncher": {
    "misrepresentedTokens": true,
    "methodology": "TVL is calculated by summing the total LAUNCH held in the staking contract.",
    "era": {
      staking: [["0xA05385Ec1F4fFe5a43336f3864Ae66f536D95602"],["0xF6D9a093A1C69a152d87e269A7d909E9D76B1815"],"era","superlauncher-dao",18],
    },
  },
  "decubate": {
    "bsc": {
      staking: [["0xD1748192aE1dB982be2FB8C3e6d893C75330884a","0xe740758a8cd372c836857defe8011e4e80e48723"],"0xEAc9873291dDAcA754EA5642114151f3035c67A2"],
    },
  },
  "polkastarter": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking only",
    "ethereum": {
      staking: ["0xc24A365A870821EB83Fd216c9596eDD89479d8d7","0x83e6f1E41cdd28eAcEB20Cb649155049Fac3D5Aa"],
    },
    "bsc": {
      staking: ["0xD558675a8c8E1fd45002010BaC970B115163dE3a","0x7e624fa0e1c4abfd309cc15719b7e2580887f570"],
    },
  },
  "the-parallel": {
    "bsc": {
      staking: [["0x21EFC3DDE8a69Fb8A5403406ebDd23e08C924785","0x9A5AC21399A6Fd7D6232CA0B52A6b0658727A3d2"],"0xd07e82440A395f3F3551b42dA9210CD1Ef4f8B24"],
    },
  },
  "paprprintr": {
    "bsc": {
      staking: ["0xa00ba88adb75d8877e4f2035f3abe43b74f10a4b","0x246475dF8703BE0C2bA2f8d0fb7248D95Cc1Ba26","bsc"],
      pool2: ["0x28165e285cb40210f6b896bc937f7322f3a2bee2","0x88afbae882348011c80bd4f659962d32ffed4089","bsc"],
    },
    "polygon": {
      staking: ["0xD524e0dE85b225A7ea29E989bF13a4deE5De1913","0xFbe49330E7B9F58a822788F86c1be38Ab902Bab1","polygon"],
      pool2: ["0xac2b5b9c4696dd96c97d3d8da6f6ff412020566d","0xb1Cd060D7c7B8F338e13D6Aac11f484eE451c5b5","polygon"],
    },
    "kcc": {
      staking: ["0xa0A0727cA35B2Af606EceDD2f69d8884DE090538","0x9dEb450638266f787E6E29d0Fe811069f828CF56","kcc"],
    },
    "fantom": {
      staking: ["0x982Df9B6e86838c7f0fB0d63eD84f98dcC110E29","0xC5e7A99A20941cBF56E0D4De608332cDB792e23e","fantom"],
    },
    "aurora": {
      staking: ["0x008757aB3E3aDE24a402882d701f9B99F3809283","0xa5C09De3aa1CDb5Cb190Be66c77E033Be1CA594A","aurora"],
    },
  },
  "libero": {
    "methodology": "We count all LIBERO deposited into LIBERO BANK, which has been locked by users in exchange for xLIBERO",
    "bsc": {
      staking: ["0xb2b11D8DA4cd9c20410de6EB55BAD2734983040E","0x0DFCb45EAE071B3b846E220560Bbcdd958414d78"],
    },
  },
  "monster": {
    "methodology": "counts the number of MST tokens in the ve contract and the pairs in the staking pool",
    "fantom": {
      staking: ["0xc8034b3dF18Ea4d607E86D6b6Bf23E2A8Ed70F89","0x152888854378201e173490956085c711f1DeD565"],
      pool2: [["0x06bFdfF7366DE711F363105F446f8399663db749","0xc13926C5CB2636a29381Da874b1e2686163DC226"],["0x1a88e447c7468b28de490b25a076a4ffc0c68b16","0x1f5c5b104d6246B3d096135806cd6C6e53e206F1"]],
    },
  },
  "mmo-finance-polygon": {
    "polygon": {
      staking: ["0x2b9299f80a644CA60c0d398e257cb72488875d2A","0x859a50979fdB2A2fD8Ba1AdCC66977C6f6b1CD5B"],
    },
  },
  "trustednode": {
    "bsc": {
      staking: ["0x98386F210af731ECbeE7cbbA12C47A8E65bC8856","0x7f12a37b6921ffac11fab16338b3ae67ee0c462b"],
      pool2: ["0x44dC7FE8e51076De1B9f863138107148b441853C","0x562C0c707984D40b98cCba889C6847DE274E5d57"],
    },
    "fantom": {
      pool2: ["0xe056aba40572f64d98a8c8e717c34e96056c4aad","0x9206444A1820c508FbA5bF815713451Ee540B3c8"],
    },
  },
  "bank-ai": {
    "ethereum": {
      staking: ["0x804Bd4F1c9B5D7864d6F215644fb931349EEACA2","0xe18ab3568fa19e0ed38bc1d974eddd501e61e12d"],
    },
  },
  "drip": {
    "methodology": "Counts the native tokens staked in the vault contract as staking.",
    "bsc": {
      staking: ["0xBFF8a1F9B5165B787a00659216D7313354D25472","0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333"],
    },
  },
  "crabada": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty of the assets(USDC) deposited through Treasury Contract; also Staking and Treasury parts",
    "avax": {
      staking: ["0xD2cd7a59Aa8f8FDc68d01b1e8A95747730b927d3","0xa32608e873f9ddef944b24798db69d80bbb4d1ed"],
    },
  },
  "meeds": {
    "methodology": "Xmeeds and TokenFactory contracts are used for calculating staking/farm volume",
    "ethereum": {
      staking: [["0x44D6d6aB50401Dd846336e9C706A492f06E1Bcd4","0x1B37D04759aD542640Cc44Ff849a373040386050"],"0x8503a7b00B4b52692cC6c14e5b96F142E30547b7"],
    },
  },
  "sunrise-gaming-by-dao": {
    "ethereum": {
      staking: ["0x7dbE40ac6bB41A5FE4Fa2C74f31d7DEFBC793B58","0x692aCCdD8b86692427E0aa4752AE917Df01CC56F"],
      pool2: ["0x7dbE40ac6bB41A5FE4Fa2C74f31d7DEFBC793B58","0xaf5a7469cf2571b973aeee9ae2f8aad00e1337d2"],
    },
  },
  "shapeshift": {
    "methodology": "We count liquidity of FOX deposited on Uniswap V2 and V3 pools on Ethereum, Arbitrum, Gnosis and a SushiSwap pool on Polygon using on-chain data. For Staking we count the FOX tokens locked in RFOX on Arbitrum and its predecessor FOXy on Ethereum which are single asset staking contracts used for revenue sharing.",
    "ethereum": {
      staking: [["0xee77aa3Fd23BbeBaf94386dD44b548e9a785ea4b","0xDc49108ce5C57bc3408c3A5E95F3d864eC386Ed3","0xDd80E21669A664Bce83E3AD9a0d74f8Dad5D9E72","0xc54b9f82c1c54e9d4d274d633c7523f2299c42a0","0x212ebf9fd3c10f371557b08e993eaab385c3932b","0x24FD7FB95dc742e23Dc3829d3e656FEeb5f67fa0","0xC14eaA8284feFF79EDc118E06caDBf3813a7e555","0xEbB1761Ad43034Fd7FaA64d84e5BbD8cB5c40b68","0x5939783dbf3e9f453a69bc9ddc1e492efac1fbcb","0x662da6c777a258382f08b979d9489c3fbbbd8ac3","0x721720784b76265aa3e34c1c7ba02a6027bcd3e5","0xe7e16e2b05440c2e484c5c41ac3e5a4d15da2744"],["0xc770eefad204b5180df6a14ee197d99d808ee52d","0x808D3E6b23516967ceAE4f17a5F9038383ED5311","0x470e8de2eBaef52014A47Cb5E6aF86884947F08c"]],
      pool2: [["0xad0E10Df5dCDF21396b9d64715aaDAf543F8B376"],["0xc770eefad204b5180df6a14ee197d99d808ee52d"]],
    },
    "arbitrum": {
      staking: [["0xac2a4fd70bcd8bab0662960455c363735f0e2b56","0x4f9c6a6cc987de98c8109e121516008906a899c9"],["0xf929de51d91c77e42f5090069e0ad7a09e513c73"]],
      pool2: [["0x5f6ce0ca13b87bd738519545d3e018e70e339c24","0x76d4D1EAA0C4b3645E75C46E573c1d4F75E9041e"],["0xf929de51d91c77e42f5090069e0ad7a09e513c73"]],
    },
    "polygon": {
      pool2: [["0x93eF615F1DdD27d0E141Ad7192623A5c45e8f200"],["0x65A05DB8322701724c197AF82C9CaE41195B0aA8"]],
    },
    "xdai": {
      pool2: [["0xC22313fD39F7d4D73A89558F9E8E444C86464BAc","0x8a0Bee989c591142414ad67FB604539d917889dF","0x75594f01dA2e4231e16e67f841C307C4Df2313d1"],["0x21a42669643f45bc0e086b8fc2ed70c23d67509d"]],
    },
  },
  "tgcasino": {
    "ethereum": {
      staking: [["0x0916568854Fc53B720186052d8013D62A0409b47","0x258C3104388f8cd72c8b4336fc536033E6dB764E"],["0x25B4f5D4C314bCD5d7962734936C957B947cb7CF"]],
    },
  },
  "commonwealth": {
    "base": {
      staking: [["0xf4aa59f5192856f41ae19caab4929ccd3a265e70","0x7519461fbd96abb539c770d57f38c2e91f8262aa","0xd7e31990883250e53314b15ee555345f04d011e8","0x87412c03979cc19c60071f5f98313a7cbe9f6d65"],"0x99b2B1A2aDB02B38222ADcD057783D7e5D1FCC7D"],
    },
  },
  "paxe": {
    "methodology": "We count the TVL on the PAXE token in the farming contract and the restaking pool",
    "bsc": {
      staking: [["0x269e1ceb128ccCD5684BbAFF9906D69eD1e9e9C8","0xbA576f5ecbA5182a20f010089107dFb00502241f"],"0xd2A3eec06719D5Ac66248003B5488E02165dd2fa"],
    },
  },
  "zeebu": {
    "methodology": "Counts ZBU tokens locked in Voting Escrow contracts across Ethereum, Base, and BSC.",
    "ethereum": {
      staking: [["0x8e76Cdf3b14c540aB54aFa7f8492AC1d16Ecfb35"],"0xe77f6aCD24185e149e329C1C0F479201b9Ec2f4B"],
    },
    "base": {
      staking: [["0xcf08d1ec5d8e566d95299399307f75f98d6aea03"],"0x2C8C89C442436CC6C0a77943E09c8Daf49Da3161"],
      pool2: [["0x45dd22aCe398002b34cB37b363B2F02C7dd47842"],["0xC3889F9764d68BDF2e16f237206746344172A147"]],
    },
    "bsc": {
      staking: [["0xd3e8cD2eDbf252860E02ffb245fD654b1ab30f30"],"0x4D3dc895a9EDb234DfA3e303A196c009dC918f84"],
    },
  },
  "chronicle": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2 only",
    "aurora": {
      staking: ["0x3838956710bcc9D122Dd23863a0549ca8D5675D6","0x7cA1C28663b76CFDe424A9494555B94846205585"],
      pool2: ["0x3838956710bcc9D122Dd23863a0549ca8D5675D6","0xb419ff9221039Bdca7bb92A131DD9CF7DEb9b8e5"],
    },
  },
  "monprotocol": {
    "methodology": "Counts the balance of staked tokens in the staking, claims, and rewards registry.",
    "ethereum": {
      staking: [["0x65A8b32bc4dE5E0156DBa85Ce615d9ef8ea59780","0xd0c40b774ecfBc7B0632d23F871Cc0E523aad8F3","0xa305A8C63a5305Cc2D4d58c41F1d7C662C95475b","0x57136E05e6b1F502bd56B5439fCC1039A8250ED2"],"0xc555D625828c4527d477e595fF1Dd5801B4a600e"],
    },
  },
  "vaderai": {
    "methodology": "$VADER coins can be staked in the protocol to earn rewards.",
    "base": {
      staking: ["0x1d6bb701eecedcd53966402064ce1c5b9eddc780","0x731814e491571a2e9ee3c5b1f7f3b962ee8f4870"],
    },
  },
  "bloxmove": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2 only",
    "ethereum": {
      staking: ["0xb39EDbC5d0b23d7F4F140bBfDE92562fB1838769","0x38d9eb07A7b8Df7D86F440A4A5c4a4c1a27E1a08"],
      pool2: ["0xb39EDbC5d0b23d7F4F140bBfDE92562fB1838769","0xE0a97733F90d089df8EeE74a8723d96196fC4931"],
    },
    "bsc": {
      staking: ["0xFaD010684a68AefAcF6BBe1357642c7C73a7Ed80","0x40e51e0ec04283e300f12f6bb98da157bb22036e"],
      pool2: ["0xFaD010684a68AefAcF6BBe1357642c7C73a7Ed80","0xD617cc09A85dC93De9FB1487ac8863936c5E511F"],
    },
  },
  "VersaGames": {
    "methodology": "TVL is calculated as value of tokens in VERSA-xVERSA staking",
    "cronos": {
      staking: ["0x8216E362d07741b562eBB02C61b1659B6B1258aD","0x00d7699b71290094ccb1a5884cd835bd65a78c17","cronos"],
    },
  },
  "fegex": {
    "timetravel": true,
    "misrepresentedTokens": true,
    "methodology": "We count liquidity of FEG token staked on ETHEREUM and BSC chains through their Staking Contracts",
    "ethereum": {
      staking: ["0x4a9D6b95459eb9532B7E4d82Ca214a3b20fa2358","0x389999216860ab8e0175387a0c90e5c52522c945"],
    },
    "bsc": {
      staking: ["0xF8303c3ac316b82bCbB34649e24616AA9ED9E5F4","0xacfc95585d80ab62f67a14c566c1b7a49fe91167"],
    },
  },
  "cateventures": {
    "methodology": "Catecoin staking pool",
    "bsc": {
      staking: ["0x2F9FbB154e6C3810f8B2D786cB863F8893E43354","0xE4FAE3Faa8300810C835970b9187c268f55D998F"],
    },
  },
  "turtle": {
    "methodology": "Staking includes tokens locked in staking contract. TVL is empty.",
    "cronos": {
      staking: ["0x7016db90c1f8b87ea4d18b7e53fb7c42999bc995","0x8C9E2bEf2962CE302ef578113eebEc62920B7e57"],
    },
  },
  "oxb": {
    "bsc": {
      staking: ["0x2281f53a583b00cb80814ccdffe1544a5274dad2","0x7536c00711E41df6aEBCCa650791107645b6bc52"],
    },
  },
  "coin98": {
    "misrepresentedTokens": true,
    "tomochain": {
      staking: ["0x39C9dB7C1412041d084fED054Fc9318B9F75AcDb","0x0Fd0288AAAE91eaF935e2eC14b23486f86516c8C"],
    },
  },
  "kittyfinance": {
    "polygon": {
      staking: ["0xA87b3c515C5D50AF8c876709e2A92e5859cd198B","0xB932D203f83B8417Be0F61D9dAFad09cc24a4715"],
      pool2: ["0xc17c09f7615c660dd5A7C1051E096240CF75685a",["0xcA75C4aA579c25D6ab3c8Ef9A70859ABF566fA1d","0x3C443ca1c986258bEb416cC35FAE95060Ac4Ab13"]],
    },
    "avax": {
      staking: ["0xDB75c7b1f8D54Fd02C456609F985F5229634429A","0x094BFaC9894d2A2A35771D0BD6d2447689190F32"],
      pool2: ["0xb7e2eBb3E667A542cDd07e8d108D5fF618315a18",["0xbC61C7eCEf56E40404fC359ef4dfd6E7528f2B09","0x2d9A57C484C60241f5340a145a3004c7E4cfE040"]],
    },
  },
  "winkyverse": {
    "methodology": "TVL for Winkyverse consists of the staking of WNK into 3 staking (time-locked) contracts.",
    "bsc": {
      staking: [["0xc45047c5b26146d10a25295912c81098f94d8d1a","0x5ff3450546c7c29cc47617f08f30b7e79371b3ed","0x574d3630ce0aa8dd4eafd9ce3f24dc5c8a2b7d15"],"0xb160A5F19ebccd8E0549549327e43DDd1D023526"],
    },
  },
  "minto": {
    "bsc": {
      staking: [["0x78ae303182fca96a4629a78ee13235e6525ebcfb","0xe742FCE58484FF7be7835D95E350c23CE55A7E12"],"0x410a56541bD912F9B60943fcB344f1E3D6F09567"],
    },
    "heco": {
      staking: [["0x78ae303182fca96a4629a78ee13235e6525ebcfb","0xe742FCE58484FF7be7835D95E350c23CE55A7E12"],"0x410a56541bd912f9b60943fcb344f1e3d6f09567"],
    },
  },
  "x-xyz": {
    "methodology": "TVL for X.xyz consists of the staking of X into veX.",
    "ethereum": {
      staking: ["0x5b8c598ef69e8eb97eb55b339a45dcf7bdc5c3a3","0x7f3141c4d6b047fb930991b450f1ed996a51cb26"],
    },
  },
  "faet": {
    "methodology": "TVL includes FAET tokens staked in the FaetStaking contract.",
    "start": 17400000,
    "lisk": {
      staking: ["0xFbb61c8C8aA305F3ced88cA7D6E7859126Dc3B83","0xdF92bA28D17329a7284A5eC230967768D4cb7A89"],
    },
  },
  "owockibot": {
    "methodology": "Counts the number of $owockibot tokens staked in the native staking contract on Base network.",
    "base": {
      staking: ["0x24b3909b653e0cc635c7c7d4f8c176fc3fc88fd9","0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07"],
    },
  },
  "celery": {
    "methodology": "Staked CLY tokens are counted towards staking metric",
    "smartbch": {
      staking: ["0x7642df81b5beaeeb331cc5a104bd13ba68c34b91","0x7642df81b5beaeeb331cc5a104bd13ba68c34b91","smartbch","celery",18],
    },
  },
  "the-open-dao-sos": {
    "methodology": "TVL for TheOpenDAO consists of the staking of SOS into veSOS to get protocol fees.",
    "ethereum": {
      staking: ["0xEDd27C961CE6f79afC16Fd287d934eE31a90D7D1","0x3b484b82567a09e2588a13d54d032153f0c0aee0"],
    },
  },
  "infinity-hedge-fund": {
    "base": {
      staking: ["0x042Fef60aD51f48C65E6106F9b950178910A3300","0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD"],
    },
  },
  "tutellus": {
    "timetravel": false,
    "methodology": "Counts the number of TUT tokens locked in Tutellus contracts.",
    "polygon": {
      staking: ["0xc7963fb87c365f67247f97d329d50b9ec5a374b8","0x12a34A6759c871C4C1E8A0A42CFc97e4D7Aaf68d"],
    },
  },
  "uplift": {
    "methodology": "Counts the number of LIFT tokens in the Staking contract",
    "start": "2021-11-18",
    "bsc": {
      staking: ["0x49C5b5f3aba18A4bCcF57AA1567ac5Bd46e82381","0x513C3200F227ebB62e3B3d00B7a83779643a71CF"],
    },
  },
  "voyager": {
    "methodology": "Voyager token VGX can be staked",
    "ethereum": {
      staking: ["0x8692e782ea478623f3342e0fb3936f6530c5d54f","0x3C4B6E6e1eA3D4863700D7F76b36B7f3D3f13E3d"],
    },
  },
  "mugen-fi": {
    "misrepresentedTokens": true,
    "doublecounted": true,
    "deadFrom": "2023-11-28",
    "arbitrum": {
      staking: ["0x25b9f82d1f1549f97b86bd0873738e30f23d15ea","0xfc77b86f3ade71793e1eec1e7944db074922856e"],
    },
  },
  "armorfinance": {
    "hallmarks": [["2022-10-31","Project rebranded as Ease. Stopped doublecounting Nexus Mutual tvl"]],
    "ethereum": {
      staking: ["0x5afedef11aa9cd7dae4023807810d97c20791dec","0x1337def16f9b486faed0293eb623dc8395dfe46a"],
    },
  },
  "moonflowerfarmers": {
    "aurora": {
      staking: ["0xDE707357D10D86aE21373b290eAbBA07360896F6","0x78b65477bba78fc11735801d559c386611d07529"],
    },
  },
  "predictcoin": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and Farming",
    "bsc": {
      staking: ["0x4b74C42b7aB96fEec003563c355f2fEfD0C80ee7","0xbdD2E3fdb879AA42748E9D47b7359323f226BA22"],
      pool2: [["0x4b74C42b7aB96fEec003563c355f2fEfD0C80ee7"],["0x47893DC78bE9231a031e594EB29636D3FCdA09B9","0xf38db36C3E1b2A93BA0EdA1ee49A86f9CbCA6980","0x3e4dfC6A8F2f1851b0694592D06DE5254afE820d"]],
    },
  },
  "printerfinancial": {
    "misrepresentedTokens": true,
    "fantom": {
      staking: ["0xb1E6B2a4e6c5717CDBf8F6b01e89455C920a3646","0xFFAbb85ADb5c25D57343547a8b32B62f03814B12"],
      pool2: ["0xF95AB2A261B0920f3d5aBc02A41dBe125eBA10aE",["0x5BfFC514670263c4c0858B00E4618c729fef6c59","0xDECC75dBF9679d7A3B6AD011A98F05b5CC6A8a9d","0xa09697EbE1C5B1c8021dc8B3b38c528efE019b29"]],
    },
    "bsc": {
      staking: ["0xC46e07BBA17Bc36F1529321d076B3B3c50b4a4B5","0xc08Aa06C1D707BF910ADA0BdEEF1353F379E64e1"],
      pool2: ["0xf4B0Fd23af6FC66886EA59A5007500a27eaEC0bB",["0xa5c4953c64e943071ef8545c092ccb4fb3c0269f","0xafa3e7f9d489d022f3d91902fb9540bab0af52c1","0x8F7c61b3FA9c18c711a42e2219B4cA6C67C47aDa"]],
    },
    "avax": {
      staking: ["0x3A6750d2b5c14456A06D9742EB34Fc920700688C","0x32975907733f93305be28e2bfd123666b7a9c863"],
      pool2: ["0x8593875bc450ebE8e9D6fDA5298E44273fB7EA0a",["0x77435089521e3b05217dbAA461a7722DfE9bDB5D","0x960a262de5ac9545391503c133bf1b069614a01f","0x16c57fb970dd46c96491cb462647da423040c899"]],
    },
    "cronos": {
      staking: ["0x3A6750d2b5c14456A06D9742EB34Fc920700688C","0x32975907733f93305BE28E2bfd123666b7A9c863"],
      pool2: ["0x8593875bc450ebE8e9D6fDA5298E44273fB7EA0a",["0xD60a097b8D5DC1caAF84b7f825f6516Ac5734D70","0x4330e62B3da05B6C41cf9F38B3d3A603840eB485","0xF1Ea7cEA3CD8849e6D4880f25767df40460F2235"]],
    },
    "polygon": {
      staking: ["0x3a0f2A0Eba2069F7F15df9B92F954c14a08A0c59","0x0731D0C0D123382C163AAe78A09390cAd2FFC941"],
      pool2: ["0x4C25fFcbAC4BB1a01FB25A73d5eca02b98753d08",["0x29689Ab7fc5438C5039864339f2A4F28E25f1aE5","0x3ff9352415999a9270d5AA80A77E675C4b0A2CB4","0x90139ccdfe463a85cfD34823465227f78C280cea"]],
    },
    "harmony": {
      staking: ["0x3A6750d2b5c14456A06D9742EB34Fc920700688C","0x32975907733f93305be28e2bfd123666b7a9c863"],
      pool2: ["0x8593875bc450ebE8e9D6fDA5298E44273fB7EA0a",["0x15a977844a276ca6d381e3a607418cc8944a2f04","0x1bE7E6D9d048b0aEF3d174646b839D0B254FaaB8","0xe527aa3f3ce67a35a217625a40fd90081c48f79b"]],
    },
  },
  "open-ticketing-ecosystem": {
    "ethereum": {
      staking: ["0x686e8500B6bE8812EB198aAbbbFA14C95c03fC88","0xc28eb2250d1ae32c7e74cfb6d6b86afc9beb6509"],
    },
    "polygon": {
      staking: ["0x686e8500B6bE8812EB198aAbbbFA14C95c03fC88","0x7844F79FC841E4F92d974C417031c76F8578c2D5"],
    },
  },
  "herafinance": {
    "metis": {
      staking: [["0x2508965Ec75498c451B9e325B7A09288f27762D8","0x2ec37306801cb2dce6526C71b28916a70a835C03","0x9abB8642ab4B184F2a56340C2766cdc0f357500E"],"0x6F05709bc91Bad933346F9E159f0D3FdBc2c9DCE"],
    },
  },
  "gensokishi": {
    "polygon": {
      staking: [["0x1b2430aeedececafb52a3ff8cc8321e9426fc82c","0x8B55fFfcF528D89fDEfEEac670d24Ae384ca083b"],"0xa3c322ad15218fbfaed26ba7f616249f7705d945","polygon"],
    },
  },
  "cryptex": {
    "methodology": "TVL includes locked LP tokens and vested team tokens",
    "bsc": {
      staking: [["0x4Dc421AEc34397b447bA1469bcD2C4185224ceC4","0x2DA458781F0BAf868009deD0512a96989bEaE841"],"0x97a30C692eCe9C317235d48287d23d358170FC40"],
    },
  },
  "timewarp": {
    "methodology": "We count as TVL the staking Lps on Ethereum (TIME-ETH Sushiswap LP)\n   and Binance (TIME-BNB Pancake LP) networks threw their TimeWarpPool contracts; and\n   we count the staking native token (TIME) on both netwarks, separated from tvl",
    "ethereum": {
      staking: ["0xa106dd3Bc6C42B3f28616FfAB615c7d494Eb629D","0x485d17A6f1B8780392d53D64751824253011A260"],
      pool2: ["0x55c825983783c984890bA89F7d7C9575814D83F2","0x1d474d4B4A62b0Ad0C819841eB2C74d1c5050524"],
    },
    "bsc": {
      staking: ["0x59f2757Ae3a1BAa21e4f397a28985Ceb431c676b","0x3b198e26E473b8faB2085b37978e36c9DE5D7f68"],
      pool2: ["0xC48467BA55cF0B777978F19701329c87949EFD3C","0xa5ebD19961CF4B8aF06a9d9D2B91d73B48744867"],
    },
  },
  "morkie": {
    "polygon": {
      staking: ["0xee1198CF7575dfb2D5D666964322B6569B23E56b","0xAFb755c5f2ea2aadBaE693d3BF2Dc2C35158dC04"],
    },
  },
  "aitech": {
    "bsc": {
      staking: ["0x2C4dD7db5Ce6A9A2FB362F64fF189AF772C31184","0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944"],
    },
  },
  "shibui": {
    "boba": {
      staking: ["0xabAF0A59Bd6E937F852aC38264fda35EC239De82","0xf08ad7c3f6b1c6843ba027ad54ed8ddb6d71169b"],
      pool2: [["0x6b8f4Fa6E44e923f5A995A87e4d79B3Bb9f8aaa3"],["0x3f714fe1380ee2204ca499d1d8a171cbdfc39eaa"]],
    },
  },
  "rubic": {
    "timetravel": false,
    "methodology": "Staking pool balance",
    "hallmarks": [["2022-06-23","Horizon bridge Hack $100m"]],
    "bsc": {
      staking: [["0x8d9Ae5a2Ecc16A66740A53Cc9080CcE29a7fD9F5","0xa96cdb86332b105065ca99432916e631e469cf5d","0x3333B155fa21A972D179921718792f1036370333"],"0x8e3bcc334657560253b83f08331d85267316e08a"],
    },
    "kava": {
    },
  },
  "ferrum": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2 only",
    "ethereum": {
      staking: [["0x71f3e1a61c14d6f4b6d2a72a13fc6fe13d8a86a9","0x16BBCf93a0f4bB27a15eE8937B58928D6158eBe9","0x41ea5097f3ea49c00ccfb35e74763d29766daddf","0x45972d73d35a315c0d8357846303209991b84ccb","0xeee410b42bc3a71271f191579858cf7e3cbb2e70","0xbD5c104AD40EF137D6810E6CCC0b2b7185410374","0x143D7eE3Fab601264248C2C3F45bE430451e353f","0x4eccea6360a4fc63ab4b37d4895bcc64e40cd9c4","0xa9ac39abc7fcfac10321ceba05050f099afb8042","0x840f8f2978521cafa659f390532de235633a15ec","0x1f4bccd90c65135e17287058b667c0a004f443cd","0x08cd09c8e42edffefc56c7fe33c547701fccb5c9","0x34fc4e1b8456ea8340902f3d7168c536db5b977d","0x96add70053eac0534899c4c51e818add70d96f7a","0x3844a75a2d81f7da0af24ef996b17ce0a18de361","0x2a300082aafe41509e3465447c6a3ac08556e5d7"],"0xE5CAeF4Af8780E59Df925470b050Fb23C43CA68C"],
    },
    "polygon": {
      pool2: ["0x11E075725d061DeB6981b19C4ea30983B4E2e070","0x0C77b6682b6fFfFe9599B41E39eBa1c1bCf923D8"],
    },
  },
  "jade1": {
    "methodology": "TVL counts JADE-WBNB LP tokens staked in farm",
    "bsc": {
      pool2: ["0xFa435cc7b37A1E3E404bBE082D48d83F2fAA3d10","0x7ae960972d668B2651261e9D4Fc40d4D983dc524"],
    },
  },
  "5ire-dapp-staking": {
    "methodology": "Total staked tokens in 5ire Dapp Staking",
    "ethereum": {
      staking: [["0xaa137EC3474ab407f3Be37b16576227dfE75Eb8D","0x83D1B4277454EDAcF54A14fc586326386648A959"],"0x3bd7d4F524D09F4e331577247A048D56e4b67a7F"],
    },
  },
  "kaito": {
    "base": {
      staking: ["0x548D3B444da39686d1a6F1544781d154e7cD1EF7","0x98d0baa52b2d063e780de12f615f963fe8537553"],
    },
  },
  "rosy-burnt-steak": {
    "methodology": "counts the number of ROSY tokens in the Steak contract.",
    "start": "2024-03-21",
    "sapphire": {
      staking: ["0x3e7ab819878bEcaC57Bd655Ab547C8e128e5b208","0x6665a6Cae3F52959f0f653E3D04270D54e6f13d8"],
    },
  },
  "flock": {
    "methodology": "counts the number of FLOCK tokens in the FLOCK GMExchange contract.",
    "start": 1747913430,
    "base": {
      staking: ["0xe1Fa4592b7a35Ff6Cef65FDEC5e13A1F48fC6123","0x5aB3D4c385B400F3aBB49e80DE2fAF6a88A7B691"],
    },
  },
  "zero1-labs": {
    "methodology": "TVL comes from the Staking Vaults",
    "ethereum": {
      staking: [["0x7AabE771aCcAa3F54a1B7c05d65c6E55d0Cd0Af6","0x88062FE2751f3D5cEC18F6113A532A611632ae79","0x8DBA1f564458dd46283ca3a4CDf6CA019963aB42","0x68605AA964F25aC8c7C159331F9dF050321FDcc6"],"0x1495bc9e44Af1F8BCB62278D2bEC4540cF0C05ea"],
    },
  },
  "meowl": {
    "methodology": "TVL for MEOWL consists of the staking of MEOWL tokens",
    "ethereum": {
      staking: [["0x679a376dab6318d62de3c87292e207532c8607a9","0x1e8ba7064e31bb3E9C041C2c2825833f499C2046"],["0x1f1f26c966f483997728bed0f9814938b2b5e294","0x556bB0B27E855e6f2cEBb47174495B9BBEB97fF1"]],
    },
  },
  "cake-monster": {
    "methodology": "counts the number of $MONSTA tokens in the Cake Monster Staking contract, excluding the amount reserved for the staking rewards.",
    "bsc": {
      staking: ["0xF7CDDF60CD076d4d64c613489aA00dCCf1E518F6","0x8A5d7FCD4c90421d21d30fCC4435948aC3618B2f"],
    },
  },
  "heroblaze": {
    "methodology": "TVL staking is calculated as the sum of the tokens staked in Hero Blaze BEP20 contracts",
    "misrepresentedTokens": true,
    "bsc": {
      staking: [["0x7f385F3d92501ba048B92F715D929Cbf15F98792","0xaA0856084Ea21541526307945231338adc809519","0x159eeaE61a592A157964f36e68407ED49a4AEf3c","0xeB700b4090e1eD4C9d34386f73b4E706C8fe334D","0x00A6e93E3ce5300e41E8ed25EBD69C328fD45E5a"],"0x5e7f472B9481C80101b22D0bA4ef4253Aa61daBc"],
    },
  },
}

module.exports = buildProtocolExports(configs, stakingOnlyExportFn)
