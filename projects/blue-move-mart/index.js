const { aQuery } = require('../helper/chain/aptos')

module.exports = {
  timetravel: false,
  methodology: "The total value locked is the value of the $MOVE coin that was staked into the BlueMove platform.",
  aptos: {
    staking: async (api) => {
    
      // Get TVL from staking MOVE to receive MOVE
      const { data: { total_moves_staking } } = await aQuery('/v1/accounts/0x400ffaf40b899bb14f883a16bed906b3977486a2bef4ad25e3e6ae0f9a3dde79/resource/0x9637eeb749cd50808be7d9bb2652af00971688d457feb002ec31af594cc77a2d::staking_move_earn_move::StakingData');    
       // Get TVL from staking MOVE to receive NFTs
      const { data } = await aQuery('/v1/accounts/0xb0879d35e9503c7cda8da6f9574cf00ab36c0704ea5b1a4d818472e093cdcee4/resource/0x352ad31333d08a45898a97a96f066ff4bfda2756c17239032c3bdd3825d1f0b0::staking_move_earn_nft::StakingData');
      // Calculate TVL
      const total_moves_staking_earn_nft = data.total_moves_staking;
      const MOVE = '0xd9f9b0b4f35276eecd1eea6985bfabe2a2bbd5575f9adb9162ccbdb4ddebde7f::smove::SMOVE'
      api.add(MOVE, total_moves_staking_earn_nft)
      api.add(MOVE, total_moves_staking)
    },
    tvl: (async) => ({}),
  }
}