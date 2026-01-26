const { function_view } = require('../helper/chain/aptos')

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async () => {
      const supply = await function_view({
        "functionStr": "0x2cc52445acc4c5e5817a0ac475976fbef966fedb6e30e7db792e10619c76181f::rewards_manager::get_staked_apt",
        "type_arguments": [],
        "args": []
      });
      return {
        aptos: supply/1e8
      }
    }
  }
}