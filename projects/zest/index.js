const { sumTokens } = require('../helper/chain/stacks')

async function tvl() {
    return sumTokens({
        owners: [
            'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-vault', // STX and SIP10 tokens
            'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token-v2'
        ],
    })
}

module.exports = {
    stacks: {
        tvl,
    },
};
