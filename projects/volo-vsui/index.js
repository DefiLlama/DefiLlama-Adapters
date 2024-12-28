const sui = require('../helper/chain/sui')

async function tvl() {
    const nativePoolObj = await sui.getObject('0x7fa2faa111b8c65bea48a23049bfd81ca8f971a262d981dcd9a17c3825cb5baf');

    const totalStakedValue = +(await sui.getDynamicFieldObject(
      nativePoolObj.fields.total_staked.fields.id.id,
      nativePoolObj.fields.staked_update_epoch,
      {
          idType: 'u64'
      })).fields.value + +nativePoolObj.fields.pending.fields.balance;

    const totalPendingRewards = +nativePoolObj.fields.total_rewards - nativePoolObj.fields.collected_rewards;
    const unstakeTicketsSupply = +nativePoolObj.fields.ticket_metadata.fields.total_supply;

    const totalStakedSui = totalStakedValue + totalPendingRewards - unstakeTicketsSupply;

    return {
        sui: totalStakedSui / 1e9,
    }
}

module.exports = {
            methodology: "Calculates the amount of SUI staked in Volo liquid staking contracts.",
    sui: {
        tvl,
    }
}
