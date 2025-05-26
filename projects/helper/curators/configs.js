const ABI = {
  ERC4626: {
    asset: 'address:asset',
    totalAssets: 'uint256:totalAssets',
  },
  aera: {
    assetRegistry: 'address:assetRegistry',
    numeraireToken: 'address:numeraireToken',
    value: 'uint256:value',
  },
  morpho: {
    CreateMetaMorphoEvent: 'event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)',
  },
  euler: {
    getProxyListLength: 'uint256:getProxyListLength',
    proxyList: 'function proxyList(uint256) view returns (address)',
    creator: 'address:creator',
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
  wc: {
    vaultFactories: [
      {
        address: '0x4DBB3a642a2146d5413750Cca3647086D9ba5F12',
        fromBlock: 9025733,
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
}

module.exports = { 
  ABI,
  MorphoConfigs,
  EulerConfigs,
}
