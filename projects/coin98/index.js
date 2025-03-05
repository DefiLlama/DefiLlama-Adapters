const { staking } = require('../helper/staking');

const POWER_POLL_CONTRACT = '0x39C9dB7C1412041d084fED054Fc9318B9F75AcDb'
const COIN98_CONTRACT = '0x0Fd0288AAAE91eaF935e2eC14b23486f86516c8C'

module.exports['tomochain'] = {
    tvl: () => ({}) ,
    staking: staking(POWER_POLL_CONTRACT, COIN98_CONTRACT)
}

module.exports.misrepresentedTokens = true