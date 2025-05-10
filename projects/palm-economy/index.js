const { sumTokens2 } = require('../helper/chain/cardano');

const PALMStaking = 'addr1wxu6gpdsy6xv5c5r9s9t3ngyh0svvn8lqgfajwgxpry3slg86ahe3'
const PALMTokenAddress = 'b7c5cd554f3e83c8aa0900a0c9053284a5348244d23d0406c28eaf4d50414c4d0a'

async function stake() {
    return await sumTokens2({
        owner: PALMStaking,
        tokens: [PALMTokenAddress]
    });
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl: () => 0,
        staking: stake
    },
}