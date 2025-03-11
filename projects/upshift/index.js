const { sumERC4626VaultsExport } = require('../helper/erc4626')
const config = {
  ethereum: ["0xB7858b66dFA38b9Cb74d00421316116A7851c273", "0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42", "0x18a5a3D575F34e5eBa92ac99B0976dBe26f9F869", "0xEBac5e50003d4B17Be422ff9775043cD61002f7f", "0xd684AF965b1c17D628ee0d77cae94259c41260F4", "0x5Fde59415625401278c4d41C6beFCe3790eb357f", "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e", "0xc824A08dB624942c5E5F330d56530cD1598859fD","0xeb402fc96C7ed2f889d837C9976D6d821c1B5f01", "0x419386E3Ef42368e602720CC458e00c0B28c47A7", "0xB78dAf3fD674B81ebeaaa88d711506fa069E1C5E"],
  avax: ["0x3408b22d8895753C9A3e14e4222E981d4E9A599E", "0xB2bFb52cfc40584AC4e9e2B36a5B8d6554A56e0b"],
  base: ["0x4e2D90f0307A93b54ACA31dc606F93FE6b9132d2"]
}

module.exports = {
  doublecounted: true,
  methodology: "TVL is the sum of tokens deposited in erc4626 vaults",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true })
  }
})