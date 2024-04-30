const sui = require('../helper/chain/sui')

async function suiTVL() {
    const stakedSuiVaultStateV1ObjectID = '0x55486449e41d89cfbdb20e005c1c5c1007858ad5b4d5d7c047d2b3b592fe8791'
    const { fields: stakedSuiVaultState } = await sui.getObject(stakedSuiVaultStateV1ObjectID)

    const suiAmount = +stakedSuiVaultState.total_sui_amount
        + +stakedSuiVaultState.atomic_unstake_sui_reserves
        + +stakedSuiVaultState.crank_incentive_reward_pool;

    return {
        sui: suiAmount / 1e9,
    }
}

module.exports = {
            methodology: "Counts the total number of SUI tokens held in Aftermath's afSUI contract.",
    sui: {
        tvl: suiTVL,
    }
}
