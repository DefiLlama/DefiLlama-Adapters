const { getResources, function_view } = require("../helper/chain/aptos");
const ADDRESSES = require('../helper/coreAssets.json')
const MGPT_ADDRESS = '0x63be1898a424616367e19bbd881f456a78470e123e2770b5b5dcdceb61279c54::movegpt_token::MovegptCoin'
const POOL_1 = "0xd22d0e14b278b8463c6a8c86baa0e89d1a982028c0d79b4c3584d74238a0dc6d"
const POOL_2 = "0x9141a7ebbf2c8ab9101d6b657321e1cc78314b71b8e8780508986119660ffee8"

async function get_staking(api) {
  let [balances_1] = await function_view(
    {
      functionStr:
        "0xccd92a8a4b4ee351190346bb04de9941b840bf42a2f003372ccec232d2b5bdcf::staking_fix_lock_duration::get_pool_staked_amount",
      type_arguments: [
        MGPT_ADDRESS
      ],
      args: [
        POOL_1
      ]
    }
  )
  let [balances_2] = await function_view(
    {
      functionStr:
        "0xccd92a8a4b4ee351190346bb04de9941b840bf42a2f003372ccec232d2b5bdcf::staking_fix_lock_duration::get_pool_staked_amount",
      type_arguments: [
        MGPT_ADDRESS
      ],
      args: [
        POOL_2
      ]
    }
  )
  addBalance(MGPT_ADDRESS, balances_1)
  addBalance(MGPT_ADDRESS, balances_2)
  async function addBalance(token, balance) {
    api.add(token, balance)
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "THE MOST TRUSTED #MOVE LAUNCHPAD ON APTOS.",
  aptos: {
    tvl: () => ({
    }),
    staking: async (api) => {
      await get_staking(api)
    },
  }
}