const ADDRESSES = require('../helper/coreAssets.json')
const VAULTS = {
  Neutral: {
    Vault: '0x90A039797E93f2c671DE25DD24E5333b5e8F9Ab3',
    OpsManager: '0x7fB9Be6824f34Ea4B026C3d2514BFB690a066500',
  },
  Up: {
    Vault: '0x2494A64ea1B3AB49b0A9F185087E77BC2049863C',
    OpsManager: '0xb7BA0796F58BE4ef03f318e3624992D279D25F95',
  },
  Down: {
    Vault: '0xE6f8f2af4e9a5C2D71Ba37FfE7646d7201ff6d42',
    OpsManager: '0x3126fa715BaF45023166B6Cd871dBeB19b785811',
  },
};

const HELPER = "0x8A2dD0eabE8b1A1066731C43AaC08dCDd50fcA63"
const SUSD = ADDRESSES.optimism.sUSD

module.exports = {
  VAULTS,
  HELPER,
  SUSD
};
