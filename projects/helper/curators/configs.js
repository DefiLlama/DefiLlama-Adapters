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
