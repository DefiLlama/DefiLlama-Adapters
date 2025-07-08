const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require("../helper/sumTokens")

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        // DEX
        [ADDRESSES.arbitrum.WETH, "0x9e8B6D29C0410B8c7E67bB151CA7C0f9F6cBa8bF"],
        // Insurance fund
        [ADDRESSES.arbitrum.WETH, "0x087E8C29d0743120A9b9d003F702FB7F450291ba"],
      ],
    }),
  },
  blast: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        // DEX
        [ADDRESSES.blast.WETH, "0xFfc0555EC5F5C44A6B529Cef94b9055799696272"],
        // Insurance fund
        [ADDRESSES.blast.WETH, "0xe2F4A2845D4183F7913EC66945b20E4c0c15DAFf"],
        // DEX Ordinals
        [
          "0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692",
          "0x0C2309C6554AabBFBcA7d5219545795DcAF6f4A9",
        ],
        // Insurance fund Ordinals
        [
          "0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692",
          "0x0b32E91C276377b3b3CdB332e902207Defe542bd",
        ],
      ],
    }),
  },
}
