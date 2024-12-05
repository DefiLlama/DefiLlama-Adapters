const { sumERC4626VaultsExport } = require('../helper/erc4626')
const config = {
  ethereum: ["0xB7858b66dFA38b9Cb74d00421316116A7851c273", "0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42", "0x18a5a3D575F34e5eBa92ac99B0976dBe26f9F869", "0xEBac5e50003d4B17Be422ff9775043cD61002f7f"],
  avax: ["0x3408b22d8895753C9A3e14e4222E981d4E9A599E"],
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