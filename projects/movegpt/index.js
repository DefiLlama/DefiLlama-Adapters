const { function_view } = require("../helper/chain/aptos");
const MGPT_ADDRESS = '0x63be1898a424616367e19bbd881f456a78470e123e2770b5b5dcdceb61279c54::movegpt_token::MovegptCoin'
const POOL_1 = "0xd22d0e14b278b8463c6a8c86baa0e89d1a982028c0d79b4c3584d74238a0dc6d"
const POOL_2 = "0x9141a7ebbf2c8ab9101d6b657321e1cc78314b71b8e8780508986119660ffee8"

async function get_staking(api) {
  async function addBalance(pool) {
    let [balance] = await function_view(
      {
        functionStr:
          "0xccd92a8a4b4ee351190346bb04de9941b840bf42a2f003372ccec232d2b5bdcf::staking_fix_lock_duration::get_pool_staked_amount",
        type_arguments: [MGPT_ADDRESS],
        args: [pool]
      }
    )
    api.addCGToken('movegpt', balance / 1e8)
  }
  await Promise.all([POOL_1, POOL_2].map(addBalance))
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is calculated by summing the staked amounts in the specified staking pools on the Aptos blockchain.",
  aptos: {
    tvl: () => ({
    }),
    staking: async (api) => {
      await get_staking(api)
    },
  }
}