const { sumTokens2 } = require('../helper/solana')

async function tvl(api) {
    const tokens = ['mPsoLV53uAGXnPJw63W91t2VDqCVZcU5rTh3PWzxnLr']
    return sumTokens2({api, tokens})
}

module.exports = {
    timetravel: false,
    methodology: 'TVL consists of deposits made to the protocol',
    solana:{
        tvl
    }
}