const { aQuery } = require('../helper/chain/aptos')

// Note: thala-lsd is under the umbrella of Thala protocols

const LSD_ACCOUNT = "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6";

module.exports = {
  timetravel: false,
  methodology: "Aggregates thAPT backing Thala LSD's APT delegation.",
  aptos: {
    tvl: async () => {
      const { data: { supply } } = await aQuery(`/v1/accounts/${LSD_ACCOUNT}/resource/0x1::coin::CoinInfo%3C${LSD_ACCOUNT}::staking::ThalaAPT%3E`)
      return {
        aptos: supply.vec[0].integer.vec[0].value / 1e8
      }
    }
  }
}
