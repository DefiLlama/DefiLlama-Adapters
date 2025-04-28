const { sumTokensExport } = require('../helper/unwrapLPs')

const preDeposit = '0xce2fD6e5BFABd5136e1D94A2F1a9f4241c9593D4'
const tokens = [
  "0x4200000000000000000000000000000000000006", // WETH
  "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", // cbETH
  "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A", // weETH
  "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", // wstETH
  "0x2416092f143378750bb29b79eD961ab195CcEea5", // ezETH
  "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c", // rETH
  "0xEDfa23602D0EC14714057867A78d01e94176BEA0", // wrsETH
]

module.exports = {
  methodology: "Sum of all ETH LSTs/LRTs in the PreDeposit contract",
  start: 1742839200,
  base: {
    tvl: sumTokensExport({ owner: preDeposit, tokens })
  },
  hallmarks: [
    [1742839200,"PreDeposit Launch"]
  ],
}
