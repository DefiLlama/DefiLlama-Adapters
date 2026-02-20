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
  morphoV2: {
    liquidityAdapter: 'address:liquidityAdapter',
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
  },
  polygon: {
    vaultFactories: [
      {
        address: '0xa9c87daB340631C34BB738625C70499e29ddDC98',
        fromBlock: 66931118,
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
  },
  hyperliquid: {
    vaultFactories: [
      {
        address: '0xec051b19d654C48c357dC974376DeB6272f24e53',
        fromBlock: 1988677,
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
  },
  plume_mainnet: {
    vaultFactories: [
      {
        address: '0x2525D453D9BA13921D5aB5D8c12F9202b0e19456',
        fromBlock: 1912478,
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
  },
  optimism: {
    vaultFactories: [
      {
        address: '0x3Bb6A6A0Bc85b367EFE0A5bAc81c5E52C892839a',
        fromBlock: 130770189,
      },
    ],
  },
  hemi: {
    vaultFactories: [
      {
        address: '0x8e52179BeB18E882040b01632440d8Ca0f01da82',
        fromBlock: 1188885,
      }
    ]
  },
  sei: {
    vaultFactories: [
      {
        address: '0x8Dea49ec5bd5AeAc8bcf96B3E187F59354118291',
        fromBlock: 168896078,
      }
    ]
  }
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
    blacklistedVaults:[
      '0x69dfa0235f5df814fb15e1d7c774dc1bc52ab338',
      '0x4c0af5d6bcb10b3c05fb5f3a846999a3d87534c7',
      '0x2de851e60e428106fc98fe94017466f8d71793d1',
      '0x3d9e5462a940684073eed7e4a13d19ae0dcd13bc',
      '0xeeb1dc1ca7ffc5b54ad1cc4c1088db4e5657cb6c',
      '0xeeb63d2d370c5318ef174d366a41507f9380f093',
      '0xa5cd24d9792f4f131f5976af935a505d19c8db2b',
      '0x196f3c7443e940911ee2bb88e019fd71400349d9',
      '0x0806af1762bdd85b167825ab1a64e31cf9497038',
      '0xb38d431e932fea77d1df0ae0dfe4400c97e597b8',
      '0x05d57366b862022f76fe93316e81e9f24218bbfc',
      '0x1cda7e7b2023c3f3c94aa1999937358fa9d01aab',
      '0x9144c0f0614dd0ace859c61cc37e5386d2ada43a',
      '0xeeaab5c863f4b1c5356af138f384adc25cb70da6',
      '0x6f2ab32a6487a2996c74ed2b173dfdf3d5eedb58',
      '0xa07b57d1bbcad5f0397fdd9e160bc208906c4f91',
      '0x7cf924a8b791b7a1660a15eeeeafbb2a40242e2c',
      '0xc8ceb7816744008f44d505320e82de49b0b4d287',
      '0x88524a3c11a5df9d83b6a25d4fb90e8e72d25983',
      '0x0f3d31c8d8b2d64b0e4edcc311bd3fcd1db40726',
      '0x616589e4709c6f5b69785a9c99120eb7792d37ad',
      '0x570149bc2784eff2bf4ee13de9e501e5d915cd4f',
      '0x79627f3d378cbe1c9fcda4e04b3baf5994224289',
      '0xf3c631b979eb59d8333374baa7c58b5aff5e24d2',
      '0x57056b888527a9ca638ca06f2e194ef73a32cafc',
      '0x911af5bf5b7dd0f83869ba857edfdc3dea8254c2',
      '0xcb44fcdeffc501f4a375bd9f93067092689697a1',
      '0x1e1482e7bc32cd085d7af61f29019ba372b63277',
      '0xf6e2ddf7a149c171e591c8d58449e371e6dc7570',
      '0x6c7b6427a0155ffa12393ee13786f2b0ab700810',
      '0xfffc9d22304cf49784e9b31ddbeb066344b2b856',
      '0x4d787b1bb6a3198f1097fff96f281e616ae28984',
      '0xd506f1e4adfcf1196b7c5d2ebf4e858e33d7a93e',
      '0x85d0986eb2e8c0b7baa6d9be44aefa5ba18ddb8a',
      '0x3864882a0ea7b5a2b74f21a9fb0838614f3e518d',
      '0xf7dd82bf2347c8b0ac6e7334eb1a0a7c980117c4',
      '0xdbc46ff39cae7f37c39363b0ca474497dad1d3cf',
      '0x8c962a8e69f0f5bda4b7372c6837c4d6550830fa',
      '0xd5ba622ae224054e98f983a560615589f954e266',
      '0x7f173f838bcab70b878fba3babf6c18003c4d95c',
      '0x857270b5bfd0b4a23242999ffe69808acf02264a',
      '0x248bff6eeec04358b68e07e546ee0dcf2bcb23a9',
      '0xe5bed43446cf82109033206c2e319f53ed49bf6a',
      '0x1f5f939465c40574f250b38f3ba6fcc325e02725',
      '0x16729f48a48e521d2ee7e64d00ace2a88c938f6c',
      '0x93ba6b17c25c1a24ee6a96bd8a94fe1a27b512e9',
      '0xd5f15887d06a699738a9f224f42eca92944b5dfc',
      '0xb93cfba2e41a6bac4065bf7e7b333d920e060429',
      '0x0d137d7899f070ccaef6550a2f24e95d5f16845f',
      '0x6579f65efb1bf0f7d3fa05fcd767cd06ad35932d',
      '0x130770f0aae81814a6289d9b6c26ca33475a3d6e',
      '0xf2f4796389ae23f11973e6939500a6c9f01866cf',
      '0x9ae05f333a298fcf4823a6cad401c407617c45dd',
      '0xee29d5b370e85138f0263dc5fea31e561d7a3e84',
      '0xcc30fae1aa6050e142aa2810fbad1f7a4507bc3c',
      '0x3b308a7ee90e6784f18d34a814532952b07fa734',
      '0xe8c575a73b73474a1a48da814981ef4a0a9c7ec7',
      '0xb8e7170307731619b14d1673c812da60b6474b4b',
      '0x5c6d9f90e88b512ea1dae66136e9e09af2aee6c2',
      '0x2ad7546a19eb5d5edb37ec88a4775995078d1cad',
      '0x8537a336fc74ea742527e8300175a7b07a108c9e',
      '0x08f04a3db30b0cd7e42e61b4e412b1123c52e8a1',
      '0x7ad07b280a17ac7af489e487eaaf004b69786a0a',
      '0xb185eed7f1220e291f548efa2412e02c714a2364',
      '0xe385b4a4ba16fdabd2ecb9c0dda206c9fa2748a3',
      '0xdebdab749330bb976fd10dc52f9a452aaf029028',
      '0x12ac805f4596c3e55bb100b4593a1b8025cd2056',
      '0x4de31e9d79afb2d1c3eb62f19f6edf9afe95a193',
      '0xde604f03e44247b31f71c4fa055f9f3ea08d1271',
      '0x6e14a20334724a194d2f8b38162522cad202b986',
      '0x826a7ca5eb95db6c175fa2d8bab39747023340d7',
      '0x6f11663766bb213003cd74eb09ff4c67145023c5',
      '0xc37fa1c70d77bded373c551a92babcee44a9d04e',
      '0x1823332514733226e80b21b9094159fb5cd3a74b',
      '0x59ae1ef9fcaff341140ea01a2e6aa5417591e014',
      '0x8c7a2c0729afb927da27d4c9aa172bc5a5fb12bb',
      '0x8b3779350ac93eab1bea44f96167580c1ae6e846',
      '0x8d024593d781b1c86ecd5d0f899d10c5e9de7069',
      '0x2497e12d79e0138a5ec0fd799f1411cde90ab472',
      '0xb2ce48fdefa4d7dbfcfad6eebe40511f4897c6ce',
      '0x9ccf74e64922d8a48b87aa4200b7c27b2b1d860a',
      '0x32c912324cfef57005f7362d1e3881847f10b7f2',
      '0x2a377470dcf0e00f6ded484ddf82df65f0fb50af',
      '0xb6a53021e7a40ea20df1e1991b0c89432073386e',
      '0x22e550043ab05065af056d5ab839569fd8937ac2',
      '0x9021ee971994807c6a137a7a86b30091820f31c6',
      '0x77c195c6fb2198ea346b17b23a97e9e9a529ddba',
      '0x392cb22c2238b7d4097777aeee757a63b967e52f',
      '0xc6414c677451689cfc966c5a02eb67937e47b8da',
      '0x8985badaf9c51862a8a1fd7e46c3b6213df79157',
      '0x3ff6b17f7a1c39e039581a36e13fcdf61f3b7777',
      '0xd7b6acc0747f0f063f8e7bd9e92c5f41d50f5cf0',
      '0xf93ada1d20b1df559ca379f53424622183c5fe54',
      '0xa1965a7e64573621a489e8f2346588ce3698c971',
      '0xe94e9a02091dd041c7ac9efbb93ce81384fa06bb',
      '0xadb3a39683bb9cec0d2adac6d847ed8220d9a5b1',
      '0xe97614a00b293102770260d3b34ba27bcfd810a1',
      '0x8cc66e2f168dbf6c628e2c13c9105bd353684806',
      '0xe5a993e6e58c39677f46cdd1a2c97711c9a16008',
      '0x1a066394aec5bfa7f445a490cf078a2e81d0ea41',
      '0xfefaf6865fdfb801937795932d111c774f3f1087',
      '0xd94912902d9baee5fa94ac40c769af8dbcf60ecd',
      '0x0871414019d6b1321db93aa71a1fc885e67b4bda',
      '0x95975a9a68d03a518ff94536abc21d412c0a4024',
      '0xda6d41dcb59d5ead3b7254401fa1d3dd6f810781',
      '0xb7ae4d4425fa9fc1922d3c3633dde6cabd138e6b',
      '0x3339b2fcacf8549102a543e76813da93edb8082b',
      '0x92b2b1f2a6ca5729839787db04f93dab77ec25e6',
      '0xc176bf24c2f4eacc614159611cedb5633a002147',
      '0x647ca0189fa2689a06b87c9391af4994d2bb1aa5',
      '0xc0d4b99cbe4f118006b786e45d3ec42c4eccd961',
      '0x9c3649c1c5c9c1b83cf4b9818778abac66df95e1',
      '0xbf014d03bb0d0d4f96ed10448062faa3564c1b33',
      '0x516161a32f36f9f8e31f6dcbe3ac8db6bb25e57f',
      '0x844e3a70eda27004084c916cf13c2b939f97563d',
      '0xdab663377739f7970c2a480960f32bc03c63cf3d',
      '0x79b8215320379735abff5b1b3984825bb4bdeab8',
      '0x148836296ae963129faa4645f09136ffbefc5f45',
      '0x564b50adec4b4e8c6b57b37ac9658694bf068225',
      '0x1c0803d4388311210c2bec79a3bdd83765333d57',
      '0x50a2247c60b0e6960d639803cdecc84a0423f733',
      '0x0f1afd1fc8b428fa6bcbd616ce52b4835760da64',
      '0x90cb9384a3176810c65382c72cf49ed407c1eae8',
      '0xa29b02f53051d5801e1b715936d9530ffd188aca',
      '0xc5ad42bd83117eab483e80603af816969041de13',
      '0x59f4b7b0807d44bfd2356f5b67dee2b738a35fb5',
      '0xb6626093146229e2e5ead97f92b2c54569920cf6',
      '0xfcb4332dcbbfd21abf3ebe2d086bebf20bed8edd',
      '0x81c52fd0ec51bf571321578bb08262b530d43b0e',
      '0xfeb040e55edb90c03df2884c15f4f8ded8add695',
      '0xcb0272826532f1b26796df593dfb318ad9e3da2f',
      '0xca1a9186c987dcc26c2a5ec3015e729816a98cdd',
      '0x8cdddfa9c35c715610ef84c5d139e0ab9b858e0d',
      '0x6a662eb7f1b68beed2977d10b5d04e9e7eb99dd2',
      '0x9015e2635f275a6c67c641010c1571f39db1dea5',
      '0xf52bea904de57a8fd29d5bcc6a2931fe3291871e',
      '0x2b39837dd7212f8c60a5aab897db8a8d8e66eea9',
      '0xae15cdc64db6dd1ff00236ad405356acb0698d68',
      '0x8c7d53d58ea77e81f5a274f537f0cb29b65eb41d',
      '0x24424449e92e5d3ac0f52f2e64bba31f60cc01d2',
      '0x24db51474102803aa322bb4b62703e95bcd1e807',
      '0xad7e8381bafd016b8afb6e7af23db138a070f7cc',
      '0xbd5d8eadb95c2b288e4f619ed39e01250be5920d',
      '0xc9d17a65823cba0b0376a969aca5bee69a5153d1',
      '0x6356f6ca5d9cf763d8804b27915517a1e53310d2',
      '0x8d79fbd7694509474198aa52fd3183df9ad350a0',
      '0xc40080d226ad1956adb1fcbac494d1a6dade382e',
      '0xfee83cb23c54957b07555172c6ffd6e10d678a71',
      '0xa9e681ec6601116781ec32a1d7cfe26e5d8b565d',
      '0xa1f45396216ac36ec22a1d9c52c649db39987c44',
      '0x4daca93176044858a237773d34fc2dd861aedd69',
      '0xc314add1358d38d26a3e1727f943b4f347808346',
      '0x5facf19daaa19294a66a59b5e2f73299b397146c',
      '0xfb36522f7a4878ed5abf468184fcab787679fd9c',
      '0x049544ff618b3345e898f6e36225858f74822707',
      '0xe4f815db7b452a9c68713b814d17bed6b65c152c',
      '0xeb87f4f90c5a685e2ac7fddfb8b7416f91d8a499',
      '0x683dbc88b371ae48962b56e36e5a0c34e3ad4caf',
      '0x9a4b4f8c10ff344c1a7e1a9dfc297492ec4343e3',
      '0xa32ba85504921c1c080ad01712271a956d9991c2',
      '0xf63152ff9a315062018a1bf38f53e9bf97c5dbda',
      '0x657cdc99dc15448e680ee39a4bd76bb0d5fcdc6d',
      '0xfc4f0376c364aafd178e16dace3a4441b90a65fa',
      '0x6a13133781b39a9e76c8ca40cb739c71c90edbbf',
      '0xf849ef2446dee453bf8988d70c72054602428348',
      '0xced0eb9efdbfd486c27d17aa55fd4a01fc7aa6e1',
      '0xa13327562924ab07f70440de8b7fd85824a99683',
      '0xa3b2e9c59a6c0a03239f89e860c27d73630572c0',
      '0x74873cc11eea09d686ad30f5ce9ec1a1152faa7c',
      '0xaf2e837150e941b87296ed7dca4a0c0b83c4242a'
    ]
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
