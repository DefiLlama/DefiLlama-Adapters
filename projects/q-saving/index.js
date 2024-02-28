const { staking } = require('../helper/staking')

const ADDRESSES = require('../helper/coreAssets.json')

const SAVING_CONTRACT = "0x7CCa96c630329c1972547e95B9f3F82eC31A916A"

module.exports = {
    q: {
        staking: staking(SAVING_CONTRACT, ADDRESSES.q.QUSD, "q", "usd-coin", 18),
        tvl: () => ({})
    },
};
