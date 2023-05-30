const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk")

const fx = (chain, factory1, factory2) => ({
  [chain]: {
    tvl: factory2 === undefined ?
      getUniTVL({
        factory: factory1,
      })
      : sdk.util.sumChainTvls([
        getUniTVL({
          factory: factory1,
        }),
        getUniTVL({
          factory: factory2,
        }),
      ])
  },
})

/* Missing
https://facts.frax.finance/pools/0x2397321b301B80A1C0911d6f9ED4b6033d43cF51
https://facts.frax.finance/pools/0xf2B9155E3C9756a18EF6572fC99B39F88a9fFf25
https://facts.frax.finance/pools/0x247b71D57Ac80883364599ad5c9D74ea5EDc8660 (2k tvl)
*/

module.exports = {
  ...fx("ethereum", "0xb076b06f669e682609fb4a8c6646d2619717be4b", "0x43ec799eadd63848443e2347c49f5f52e8fe0f6f"),
  ...fx("arbitrum", "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E"),
  ...fx("avax", "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E"),
  ...fx("bsc", "0xa007a9716dba05289df85A90d0Fd9D39BEE808dE"),
  ...fx("dogechain", "0x67b7DA7c0564c6aC080f0A6D9fB4675e52E6bF1d"),
  ...fx("fantom", "0xF55C563148cA0c0F1626834ec1B8651844D76792","0xDc745E09fC459aDC295E2e7baACe881354dB7F64"),
  ...fx("moonbeam", "0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E"),
  ...fx("polygon", "0xc2544A32872A91F4A553b404C6950e89De901fdb"),
};
