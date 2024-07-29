const { function_view } = require('../helper/chain/aptos')

// Note: thala-lsd is under the umbrella of Thala protocols

const LSD_ACCOUNT = "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6";

module.exports = {
  timetravel: false,
  methodology: "Aggregates APT in delegation pools backing Thala LSD.",
  aptos: {
    tvl: async () => {
      const delegation_pools = (await function_view({
        functionStr: `${LSD_ACCOUNT}::pool_router::get_pools`,
        type_arguments: [],
        args: []
      }))[0];
      let total_apt = 0;
  
      for (let i = 0; i < delegation_pools.length; i++) {
        const [active, inactive, pending_active, pending_inactive] = await function_view({
          functionStr: `0x1::delegation_pool::get_delegation_pool_stake`,
          type_arguments: [],
          args: [delegation_pools[i]]
        });
        total_apt += Number(active) + Number(inactive) + Number(pending_active) + Number(pending_inactive);
      }
          
      return {
        aptos: total_apt / 1e8
      }
    }
  }
}

