const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  bob: {
    tvl: (api) =>
      sumTokens2({
        api,
        chain: "bob",
        tokens: [
          ADDRESSES.bob.WBTC,
          ADDRESSES.bob.TBTC,
        ],
        owners: [
          // taken from onramp factory (allOnramps): https://explorer.gobob.xyz/address/0x1831d29376eb94bba3ca855af7984db923768b27?tab=read_contract
          "0x587e6E2b280C70ec811a371671D3CBE9D7b9F691",
          "0xA1884124a52331Bc2fa66e2b0EFa15856C6830c6",
          "0x2e0A1Fa2f61985c475B869559cF2Cf733d4DB282",
          "0xCA94d277d04e8e6ce960F7492b2df62e2215d562",
          "0x9BBBc8F4e4258cC9Ec79164DDB7ef72954f381E2",
          "0x47340424457463Fa77B59FDAdea31cA886a241FD",
          // V2 gateways taken from gateway registry (allGateways): https://explorer.gobob.xyz/address/0x37f330e667208633e1da1cf601d01f0ef8484306?tab=read_contract
          "0x1578c26085b45A559D6B4D4cCfc1DD9e5c66F7B6",
          "0x2a7b7Db980B2228D5FfC47711D09d13F8F90961e",
        ],
      }),
  }
};

