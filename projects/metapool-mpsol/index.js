const { sumTokens2 } = require('../helper/solana')

async function tvl(api) {
    const tokens = ['mPsoLV53uAGXnPJw63W91t2VDqCVZcU5rTh3PWzxnLr']
    return sumTokens2({api, tokens})
}

module.exports = {
    timetravel: false,
    methodology: 'Calculated by multiplying the tokens Total Supply on Solana with the current market price per token. Numbers may be unrealistic if the onchain supply is much smaller than the reported circulating supply.',
    solana:{
        tvl
    }
}