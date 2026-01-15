const sui = require('../helper/chain/sui')

const ADDRESSES = require('../helper/coreAssets.json')

async function suiTVL(api) {

  const walCoinType = ADDRESSES.sui.WAL

  const suiStakingObjectID = '0x47b224762220393057ebf4f70501b6e657c3e56684737568439a04f80849b2ca'
  const { fields: suiStaking } = await sui.getObject(suiStakingObjectID)

  const walStakingObjectID = '0x9e5f6537be1a5b658ec7eed23160df0b28c799563f6c41e9becc9ad633cb592b'
  const { fields: walStaking } = await sui.getObject(walStakingObjectID)

  const suiAmount = +suiStaking.total_staked + +suiStaking.total_rewards - +suiStaking.total_protocol_fees -
    +suiStaking.uncollected_protocol_fees - +suiStaking.total_unstaked + +suiStaking.unclaimed_sui_amount;

  const walAmount = +walStaking.total_staked + +walStaking.total_rewards - +walStaking.collected_protocol_fees -
    +walStaking.uncollected_protocol_fees - +walStaking.total_unstaked + +walStaking.unclaimed_wal_amount;

  api.add(walCoinType, walAmount);
  api.add(ADDRESSES.sui.SUI, suiAmount);
}

module.exports = {
  sui: {
    tvl: suiTVL,
  }
}