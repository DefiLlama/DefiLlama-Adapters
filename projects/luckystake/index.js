const { queryContract } = require('../helper/chain/cosmos')

const ADDRESSES = {
    LS_CONTRACT: 'mantra1ua04lz6ztuuhpjt4lfvg4e52rd806hhmajzvjjxrhh70zy3fmvlqppkygu',
}

async function tvl(api) {
    const data = await queryContract({ chain: 'mantra', contract: ADDRESSES.LS_CONTRACT, data: { get_prize_pool: {} } })
    api.add('uom', data.total_staked)
}

module.exports = {
    methodology: "Returns total amount staked in the LuckyStake No Loss Lottery.",
    timetravel: false,
    mantra: { tvl },
};
