const iota = require('../helper/chain/iota')

const POOL_ID = '0xb435fa61ee8d5473ab36de02c88756f8c74fcc031b4e3a2fe2a6647bb06b2872'

async function tvl() {
    const pool = await iota.getObject(POOL_ID)
    const fields = pool.fields

    const totalStaked = BigInt(fields.total_staked || '0')
    const pending = BigInt(fields.pending?.fields?.value || fields.pending || '0')
    const totalRewards = BigInt(fields.total_rewards || '0')
    const collectedRewards = BigInt(fields.collected_rewards || '0')

    // TVL = staked + pending + uncollected rewards
    const totalIota = totalStaked + pending + (totalRewards - collectedRewards)

    return {
        iota: Number(totalIota / BigInt(1e9)),
    }
}

module.exports = {
    methodology: "Counts the total IOTA staked in TokenLabs vIOTA liquid staking contracts, including pending deposits and uncollected staking rewards.",
    timetravel: false,
    iota: {
        tvl,
    },
}
