const { aQuery, function_view } = require('../helper/chain/aptos')

// Note: thala-lsd is under the umbrella of Thala protocols

const LSD_ACCOUNT = "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6";
const THALA_VALIDATOR = "0xe888a0adfb4ca871bfe6aada8511f5326e877a8ce66a9980ef089eb2218d740c";

module.exports = {
  timetravel: false,
  methodology: "Aggregates thAPT backing Thala LSD's APT delegation.",
  aptos: {
    tvl: async () => {
      const { data: { supply } } = await aQuery(`/v1/accounts/${LSD_ACCOUNT}/resource/0x1::coin::CoinInfo%3C${LSD_ACCOUNT}::staking::ThalaAPT%3E`);
      const [active, inactive, pending_active, pending_inactive] = await function_view({
        functionStr: `0x1::delegation_pool::get_delegation_pool_stake`,
        args: [THALA_VALIDATOR]
      });
      const validator_apt = Number(active) + Number(inactive) + Number(pending_active) + Number(pending_inactive);
      
      return {
        aptos: (Number(supply.vec[0].integer.vec[0].value) + validator_apt) / 1e8
      }
    }
  }
}
