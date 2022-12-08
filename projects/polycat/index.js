const { yieldHelper } = require('../helper/yieldHelper')
const abi = require("./abi.json");
const vaultchef = "0xBdA1f897E851c7EF22CD490D2Cf2DAce4645A904";
const fish = "0x3a3df212b7aa91aa0402b9035b098891d276572b";

module.exports = yieldHelper({
  project: 'polycat',
  chain: 'polygon',
  masterchef: vaultchef,
  nativeToken: fish,
  blacklistedTokens: ['0xd76D74DE1EF47E6A390FA53b3b11ef095d0c738c'],
  abis: {
    poolInfo: abi.poolInfo
  }
})
