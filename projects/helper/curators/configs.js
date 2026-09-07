const { allAbi, abi, assets, allAbiV2, abiV2, assetsV2 } = require("./vesu")

const ABI = {
  owner: 'address:owner',
  decimals: 'uint8:decimals',
  totalSupply: 'uint256:totalSupply',
  ERC4626: {
    asset: 'address:asset',
    totalAssets: 'uint256:totalAssets',
    balanceOf: 'function balanceOf(address account) view returns (uint256)',
    convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
  },
  accountable : {
    vault: 'address:vault',
  },
  morphoV2: {
    liquidityAdapter: 'address:liquidityAdapter',
    adapters: 'function adapters(uint256) view returns (address)',
  },
  morphoAdapter: {
    morphoVaultV1: 'address:morphoVaultV1',
  },
  aera: {
    assetRegistry: 'address:assetRegistry',
    numeraireToken: 'address:numeraireToken',
    value: 'uint256:value',
  },
  morpho: {
    CreateMetaMorphoEvent: 'event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)',
    CreateVaultV2Event: 'event CreateVaultV2(address indexed owner, address indexed asset, bytes32 salt, address indexed newVaultV2)',
  },
  euler: {
    getProxyListLength: 'uint256:getProxyListLength',
    proxyList: 'function proxyList(uint256) view returns (address)',
    creator: 'address:creator',
  },
  silo: {
    CreateSiloVaultEvent: 'event CreateSiloVault(address indexed vault, address incentivesController, address idleVault)',
  },
  boringVault: {
    hook: 'address:hook',
    accountant: 'address:accountant',
    base: 'address:base',
    getRate: 'uint256:getRate',
  },
  symbiotic: {
    collateral: 'address:collateral',
    totalStake: 'uint256:totalStake',
  },
}

const MorphoConfigs = {
  ethereum: {
    vaultFactories: [
      {
        address: '0xa9c3d3a366466fa809d1ae982fb2c46e5fc41101',
        fromBlock: 18925584,
      },
      {
        address: '0x1897a8997241c1cd4bd0698647e4eb7213535c24',
        fromBlock: 21439510,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xA1D94F746dEfa1928926b84fB2596c06926C0405',
        fromBlock: 23375073,
      },
    ],
  },
  arc: {
    vaultFactoriesV2: [
      {
        address: '0x3b0eefaBfa22ec7CF2c73877ac16e78D76749f12',
        fromBlock: 1,
      },
    ],
  },
  base: {
    vaultFactories: [
      {
        address: '0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101',
        fromBlock: 13978134,
      },
      {
        address: '0xFf62A7c278C62eD665133147129245053Bbf5918',
        fromBlock: 23928808,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x4501125508079A99ebBebCE205DeC9593C2b5857',
        fromBlock: 35615206,
      },
    ],
  },
  polygon: {
    vaultFactories: [
      {
        address: '0xa9c87daB340631C34BB738625C70499e29ddDC98',
        fromBlock: 66931118,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xC11a53eE9B1eCc7a068D8e40F8F17926584F97Cf',
        fromBlock: 77371907,
      },
    ],
  },
  monad: {
    vaultFactories: [
      {
        address: '0x33f20973275B2F574488b18929cd7DCBf1AbF275',
        fromBlock: 32320327
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x8B2F922162FBb60A6a072cC784A2E4168fB0bb0c',
        fromBlock: 32321811
      }
    ]
  },
  wc: {
    vaultFactories: [
      {
        address: '0x4DBB3a642a2146d5413750Cca3647086D9ba5F12',
        fromBlock: 9025733,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x6846EA318B6B987Ee6b28eBFd87c3409F1d13108',
        fromBlock: 20253005,
      },
    ],
  },
  corn: {
    vaultFactories: [
      {
        address: '0xe430821595602eA5DD0cD350f86987437c7362fA',
        fromBlock: 253027,
      },
    ],
  },
  unichain: {
    vaultFactories: [
      {
        address: '0xe9EdE3929F43a7062a007C3e8652e4ACa610Bdc0',
        fromBlock: 9316789,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xC9b34c108014B44e5a189A830e7e04c56704a0c9',
        fromBlock: 29092109,
      },
    ],
  },
  hyperliquid: {
    vaultFactories: [
      {
        address: '0xec051b19d654C48c357dC974376DeB6272f24e53',
        fromBlock: 1988677,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xD7217E5687FF1071356C780b5fe4803D9D967da7',
        fromBlock: 14188393,
      },
    ],
  },
  katana: {
    vaultFactories: [
      {
        address: '0x1c8De6889acee12257899BFeAa2b7e534de32E16',
        fromBlock: 2741420,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xFcb8b57E56787bB29e130Fca67f3c5a1232975D1',
        fromBlock: 13096629,
      },
    ],
  },
  plume_mainnet: {
    vaultFactories: [
      {
        address: '0x2525D453D9BA13921D5aB5D8c12F9202b0e19456',
        fromBlock: 1912478,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x4f0a370bb367843CFd914c4d9972523aD2f8FCc9',
        fromBlock: 765994,
      },
    ],
  },
  arbitrum: {
    vaultFactories: [
      {
        address: '0x878988f5f561081deEa117717052164ea1Ef0c82',
        fromBlock: 296447195,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x6b46fa3cc9EBF8aB230aBAc664E37F2966Bf7971',
        fromBlock: 387016724,
      },
    ],
  },
  optimism: {
    vaultFactories: [
      {
        address: '0x3Bb6A6A0Bc85b367EFE0A5bAc81c5E52C892839a',
        fromBlock: 130770189,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x6128b680b277Bf4Df80DFE9D8c55A498660870ef',
        fromBlock: 142122059,
      },
    ],
  },
  hemi: {
    vaultFactories: [
      {
        address: '0x8e52179BeB18E882040b01632440d8Ca0f01da82',
        fromBlock: 1188885,
      }
    ],
    vaultFactoriesV2: [
      {
        address: '0x3c75C433e7902193497617EaFCc8385A3D031836',
        fromBlock: 1188872,
      },
    ]
  },
  sei: {
    vaultFactories: [
      {
        address: '0x8Dea49ec5bd5AeAc8bcf96B3E187F59354118291',
        fromBlock: 168896078,
      }
    ],
    vaultFactoriesV2: [
      {
        address: '0x30f5b078C80bD06fEdc3B40b4a4441a96Dd9cf22',
        fromBlock: 166036723,
      },
    ]
  },
  celo: {
    vaultFactories: [
      {
        address: '0x6870aa9f66c1e5efe8dbe8730e86e9e91f688275',
        fromBlock: 40259931,
      }
    ],
    vaultFactoriesV2: [
      {
        address: '0xB237fdB403992f4AAe0963F5304799242035E22d',
        fromBlock: 40249329,
      },
    ]
  },
  klaytn: {
    vaultFactoriesV2: [
      {
        address: '0xf2Aecd4a4d4C21d08770e34F392C4C271aBD9144',
        fromBlock: 213463014,
      }
    ]
  },
  tempo: {
    vaultFactoriesV2: [
      {
        address: '0x3DE400E3F79113194fa5AF6Ae5C474947E0C82Db',
        fromBlock: 12653218,
      }
    ]
  },
  stable: {
    vaultFactoriesV2: [
      {
        address: '0x7fc35488803D49D00a94b206A223f7661898BE3a',
        fromBlock: 1506183,
      }
    ],
    vaultFactories: [
      {
        address: '0xb4ae5673c48621189E2bEfBA96F31912032DD1AE',
        fromBlock: 1504774,
      },
    ],
  },
  robinhood: {
    vaultFactoriesV2: [
      {
        address: '0x0FBad98595b0186dA120E41f77C102beb49f803c',
        fromBlock: 286,
      }
    ]
  },
  pharos: {
    vaultFactoriesV2: [
      {
        address: '0x8e01ed1e1a41029b3137fce9aa880c0a54827498',
        fromBlock: 4240410,
      }
    ]
  },
  megaeth: {
    vaultFactoriesV2: [
      {
        address: '0xf133FA5A78C398B31Cc4a180E6Ae84111D6DCF5B',
        fromBlock: 16409067,
      }
    ]
  },
  morph: {
    vaultFactoriesV2: [
      {
        address: '0x7D8BF8B276f967F7539c9e91E1a85a33fefE612B',
        fromBlock: 23180183,
      }
    ]
  },
  abstract: {
    vaultFactories: [
      {
        address: '0x83A7f60c9fc57cEf1e8001bda98783AA1A53E4b1',
        fromBlock: 13947713,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xecCd168c7d8e40f7166Fe226B4cf2cA3Db7A9754',
        fromBlock: 13947713,
      },
    ],
  },
  avax: {
    vaultFactoriesV2: [
      {
        address: '0xf7b1d9e43BAeA3705f2B303693766ACbcfec6A55',
        fromBlock: 75315994,
      },
    ],
  },
  btr: {
    vaultFactories: [
      {
        address: '0xb95De4a9C81Ba6240378F383f88592d30937d048',
        fromBlock: 13516997,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x20d7eAd4830b53fB29bb4C4e8a80FD5F1f7d7F2c',
        fromBlock: 13516997,
      },
    ],
  },
  bsc: {
    vaultFactories: [
      {
        address: '0x92983687e672cA6d96530f9Dbe11a196cE905d72',
        fromBlock: 54344680,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x29955201601630f686beAF47b0B03be7b86d160F',
        fromBlock: 54344680,
      },
    ],
  },
  camp: {
    vaultFactories: [
      {
        address: '0x3F4b9246b7Cd3F7671c70BeBd5AAFC08e5bb5f16',
        fromBlock: 2410440,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xc3D327910415f894CB63f8EDceF886b32bdD5B2F',
        fromBlock: 17788365,
      },
    ],
  },
  citrea: {
    vaultFactoriesV2: [
      {
        address: '0x3137e22F379A1Df004DDb10EBbecF1CfD8CbC0e2',
        fromBlock: 2528230,
      },
    ],
  },
  cronos: {
    vaultFactories: [
      {
        address: '0xEA67e5566Ca2c0176d9db172A7f9A1e1F22E9D3A',
        fromBlock: 38459727,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x05519a0835a1bFD90f110aA7ca46e9A5F81Ed3b4',
        fromBlock: 38461643,
      },
    ],
  },
  eden: {
    vaultFactoriesV2: [
      {
        address: '0x9aaCAA01F5e6BC876D07f023744E3E0A456a64cf',
        fromBlock: 53366326,
      },
    ],
  },
  etlk: {
    vaultFactories: [
      {
        address: '0x997a79c3C04c5B9eb27d343ae126bcCFb5D74781',
        fromBlock: 21047448,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xDa4C5e0f8830002750f788eA729891B4B38EC1c2',
        fromBlock: 21047448,
      },
    ],
  },
  flare: {
    vaultFactoriesV2: [
      {
        address: '0x6FC83ECc0e8142635D77200e5052be8A0a9D2f42',
        fromBlock: 52378788,
      },
    ],
  },
  fraxtal: {
    vaultFactories: [
      {
        address: '0x27D4Af0AC9E7FDfA6D0853236f249CC27AE79488',
        fromBlock: 15317931,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x711bCE12269a3a496eFaABB8B9AD5A4485E08A24',
        fromBlock: 15317931,
      },
    ],
  },
  gensyn: {
    vaultFactoriesV2: [
      {
        address: '0xe2558155AEcEF57cAADB98e39b0538ab0ae95693',
        fromBlock: 7520624,
      },
    ],
  },
  ink: {
    vaultFactories: [
      {
        address: '0xd3f39505d0c48AFED3549D625982FdC38Ea9904b',
        fromBlock: 4078776,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x35587F8d98eA305FB762934a63F3c1564037F9C7',
        fromBlock: 4078776,
      },
    ],
  },
  linea: {
    vaultFactories: [
      {
        address: '0xA148a8223B622A72dC36472DE1492aBb5c089BA7',
        fromBlock: 25072608,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x5DC11CF8BA4C39d1194F91218D35008d9F52A5d0',
        fromBlock: 25072608,
      },
    ],
  },
  lisk: {
    vaultFactories: [
      {
        address: '0x01dD876130690469F685a65C2B295A90a81BaD91',
        fromBlock: 15731231,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x8DB1483C64384FA8581D6e6e82C6F44812090c2d',
        fromBlock: 15731231,
      },
    ],
  },
  mode: {
    vaultFactories: [
      {
        address: '0xae5b0884bfff430493D6C844B9fd052Af7d79278',
        fromBlock: 19983370,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x68DCEA6df0f07385946AA0cDA2648c27a050e26e',
        fromBlock: 19983370,
      },
    ],
  },
  plasma: {
    vaultFactories: [
      {
        address: '0x69410429099018fa1586aAB0aFADC525314f5830',
        fromBlock: 2920140,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xD7373D3597C26e7340B0612C938EEFE6DE02Ab30',
        fromBlock: 2921253,
      },
    ],
  },
  rise: {
    vaultFactoriesV2: [
      {
        address: '0x0B84EdB54100687Cca40041bE88b17c4DD8FCEb0',
        fromBlock: 6149902,
      },
    ],
  },
  scroll: {
    vaultFactories: [
      {
        address: '0x56b65742ade55015e6480959808229Ad6dbc9295',
        fromBlock: 12842868,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x474cdCF6B3be2eb770065b88d2F7c57A9BC609E0',
        fromBlock: 12842868,
      },
    ],
  },
  soneium: {
    vaultFactories: [
      {
        address: '0x7026b436f294e560b3C26E731f5cac5992cA2B33',
        fromBlock: 6440817,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x783b4853Da42DBA4A86eFa4b94ABd48100c6D982',
        fromBlock: 6440817,
      },
    ],
  },
  sonic: {
    vaultFactories: [
      {
        address: '0x0cE9e3512CB4df8ae7e265e62Fb9258dc14f12e8',
        fromBlock: 9100931,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0xc8BE2FD6f65FB3ce25Dd6a50F21A9245B9E399d7',
        fromBlock: 9100931,
      },
    ],
  },
  tac: {
    vaultFactories: [
      {
        address: '0xcDA78f4979d17Ec93052A84A12001fe0088AD734',
        fromBlock: 1308542,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x0437C5B0CF1edFb8309613E4fEBE2a512D9a735d',
        fromBlock: 1308542,
      },
    ],
  },
  xdai: {
    vaultFactories: [
      {
        address: '0xFf3623eAdB1DD8590b902fA23baCfaB3c361Bf68',
        fromBlock: 42201689,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x778aCb5109ba6f36C7FCfD0997E2d8501A555C9e',
        fromBlock: 42201689,
      },
    ],
  },
  xdc: {
    vaultFactoriesV2: [
      {
        address: '0x227544d6989cD15c05AAB6dde4F29523dcfdbe2B',
        fromBlock: 101757515,
      },
    ],
  },
  zircuit: {
    vaultFactories: [
      {
        address: '0xd2c9068aD68c4c9F1A4fE1Ea650BdFE13DC5EaF1',
        fromBlock: 14640172,
      },
    ],
    vaultFactoriesV2: [
      {
        address: '0x49bbF0Da22c66083ED7F2c0CaA5916C8b94eb5F1',
        fromBlock: 14640172,
      },
    ],
  },
}

const EulerConfigs = {
  ethereum: {
    vaultFactories: [
      '0x29a56a1b8214d9cf7c5561811750d5cbdb45cc8e',
    ],
  },
  base: {
    vaultFactories: [
      '0x7f321498a801a191a93c840750ed637149ddf8d0',
    ],
  },
  unichain: {
    vaultFactories: [
      '0xbad8b5bdfb2bcbcd78cc9f1573d3aad6e865e752',
    ],
  },
  swellchain: {
    vaultFactories: [
      '0x238bf86bb451ec3ca69bb855f91bda001ab118b9',
    ],
  },
  sonic: {
    vaultFactories: [
      '0xf075cc8660b51d0b8a4474e3f47edac5fa034cfb',
    ],
  },
  berachain: {
    vaultFactories: [
      '0x5c13fb43ae9bae8470f646ea647784534e9543af',
    ],
  },
  avax: {
    vaultFactories: [
      '0xaf4b4c18b17f6a2b32f6c398a3910bdcd7f26181',
    ],
  },
  bob: {
    vaultFactories: [
      '0x046a9837A61d6b6263f54F4E27EE072bA4bdC7e4',
    ],
  },
  bsc: {
    vaultFactories: [
      '0x7f53e2755eb3c43824e162f7f6f087832b9c9df6',
    ],
  },
  tac: {
    vaultFactories: [
      '0x2b21621b8Ef1406699a99071ce04ec14cCd50677',
    ],
  },
  plasma: {
    vaultFactories: [
      '0x42388213C6F56D7E1477632b58Ae6Bba9adeEeA3',
    ],
  },
  linea: {
    vaultFactories: [
      '0x84711986fd3bf0bfe4a8e6d7f4e22e67f7f27f04',
    ],
  },
  arbitrum: {
    vaultFactories: [
      '0x78df1cf5bf06a7f27f2acc580b934238c1b80d50',
    ],
  },
  monad: {
    vaultFactories: [
      '0xba4dd672062de8feedb665dd4410658864483f1e',
    ],
  },
  hyperliquid: {
    vaultFactories: [
      '0xcF5552580fD364cdBBFcB5Ae345f75674c59273A',
    ],
  },
}

const SiloConfigs = {
  sonic: {
    vaultFactories: [
      {
        address: '0x7867f2b584e91d7c3798f4659b6fffa3631ea06a',
        fromBlock: 21718349,
      },
      {
        address: '0x02BbB86731EC6aA81B52961e14dD1AebE5171b1d',
        fromBlock: 32865457,
      }
    ],
    blacklistedVaults: [
      '0xcca902f2d3d265151f123d8ce8fdac38ba9745ed',
      '0x2bc6f1406d736cc09631676c992abbf2ced789e7',
      '0xf75ae954d30217b4ee70dbfb33f04162aa3cf260',
      '0xb47cb414aab743c977dfd1fdb758f971907e810e',
      '0xf6f87073cf8929c206a77b0694619dc776f89885',
      '0x391b3f70e254d582588b27e97e48d1cfcdf0be7e',
      '0x9a1bf5365edbb99c2c61ca6d9ffad0b705acfc6f',
      '0xb6a23cb29e512df41876b28d7a848bd831f9c5ba',
      '0xf6bc16b79c469b94cdd25f3e2334dd4fee47a581',
    ]
  },
  ethereum: {
    vaultFactories: [
      {
        address: '0xe7Ed54e4e432Cf85024f8D4434cB3756338469B0',
        fromBlock: 22666249,
      }
    ],
    blacklistedVaults: [
      '0x8399c8fc273bd165c346af74a02e65f10e4fd78f',
    ]
  },
  arbitrum: {
    vaultFactories: [
      {
        address: '0x451b35b2dF223a7Ef71c4ecb451C1C15019e28A5',
        fromBlock: 345527587,
      }
    ],
    blacklistedVaults: [
      '0x7c1c43df1b08a7de4e25e7a8f5867efdcc812b95',
      '0x2ba39e5388ac6c702cb29aea78d52aa66832f1ee',
      '0xac69cfe6bb269cebf8ab4764d7e678c3658b99f2',
    ]
  },
  avax: {
    vaultFactories: [
      {
        address: '0x77cbCB96fFFe44d344c54A5868C49ad1C5AaAC6A',
        fromBlock: 64052773,
      }
    ],
    blacklistedVaults: [
      '0x4dc1ce9b9f9ef00c144bfad305f16c62293dc0e8',
      '0x1f8e769b5b6010b2c2bbcd68629ea1a0a0eda7e3',
      '0x6c09bfdc1df45d6c4ff78dc9f1c13af29eb335d4',
      '0x3d7b0c3997e48fa3fc96cd057d1fb4e5f891835b',
      '0x36e2aa296e798ca6262dc5fad5f5660e638d5402',
    ]
  }
}

const VesuConfigs = {
  allAbi,
  abi,
  assets,
  allAbiV2,
  abiV2,
  assetsV2,
  singleton: '0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160',
  poolFactory: '0x03760f903a37948f97302736f89ce30290e45f441559325026842b7a6fb388c0',
}

module.exports = { 
  ABI,
  MorphoConfigs,
  EulerConfigs,
  SiloConfigs,
  VesuConfigs,
}
