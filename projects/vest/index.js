const { staking } = require("../helper/staking");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Total USDC locked in the Vest Exchange.",
  start: '2024-03-17',
  era: {
    tvl: staking([
        "0xf7483A1464DeF6b8d5A6Caca4A8ce7E5be8F1F68",
        "0x7ccF5BbeC69c790D27dA3b5398B9e0d6D6EeC9F3",
      ], ADDRESSES.era.USDC),
  },
  base: {
    tvl: staking(
      "0xE80F92077131b9890599E418AE323de71cE1C35a",
      ADDRESSES.base.USDC
    ),
  },
  optimism: {
    tvl: staking(
      "0xE80F92077131b9890599E418AE323de71cE1C35a",
      ADDRESSES.optimism.USDC_CIRCLE
    ),
  },
  ethereum: {
    tvl: staking(
      "0xE80F92077131b9890599E418AE323de71cE1C35a",
      ADDRESSES.ethereum.USDC
    ),
  },
  polygon: {
    tvl: staking(
      "0xE80F92077131b9890599E418AE323de71cE1C35a",
      ADDRESSES.polygon.USDC_CIRCLE
    ),
  },
  arbitrum: {
    tvl: staking(
      "0x80C526d1c2fddADB3Cd39810cd7A79E07b0EDa00",
      ADDRESSES.arbitrum.USDC_CIRCLE
    ),
  },
}