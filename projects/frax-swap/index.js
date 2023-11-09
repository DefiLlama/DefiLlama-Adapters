const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk")

const fx = (chain, ...factories) => ({
  [chain]: {
    tvl: sdk.util.sumChainTvls(factories.map(factory => getUniTVL({ factory })))
  },
})

/* Missing
https://facts.frax.finance/pools/0x2397321b301B80A1C0911d6f9ED4b6033d43cF51
https://facts.frax.finance/pools/0xf2B9155E3C9756a18EF6572fC99B39F88a9fFf25
https://facts.frax.finance/pools/0x247b71D57Ac80883364599ad5c9D74ea5EDc8660 (2k tvl)
*/

module.exports = {
  ...fx("ethereum", "0xb076b06f669e682609fb4a8c6646d2619717be4b", "0x43ec799eadd63848443e2347c49f5f52e8fe0f6f"),
  ...fx("arbitrum", "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E", "0x8374A74A728f06bEa6B7259C68AA7BBB732bfeaD"),
  ...fx("avax", "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E", "0xf77ca9B635898980fb219b4F4605C50e4ba58afF"),
  ...fx("bsc", "0xa007a9716dba05289df85A90d0Fd9D39BEE808dE", "0xf89e6CA06121B6d4370f4B196Ae458e8b969A011"),
  ...fx("dogechain", "0x67b7DA7c0564c6aC080f0A6D9fB4675e52E6bF1d"),
  ...fx("fantom", "0xF55C563148cA0c0F1626834ec1B8651844D76792", "0xDc745E09fC459aDC295E2e7baACe881354dB7F64"),
  ...fx("moonbeam", "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E", "0x51f9DBEd76f5Dcf209817f641b549aa82F35D23F"),
  ...fx("polygon", "0xc2544A32872A91F4A553b404C6950e89De901fdb", "0x54F454D747e037Da288dB568D4121117EAb34e79"),
};
