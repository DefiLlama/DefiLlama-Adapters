const sdk = require('@defillama/sdk')
const { getTrxBalance, getTokenBalance } = require('../helper/chain/tron')

async function tvl() {

    const balances = {}

    sdk.util.sumSingleBalance(balances, 'tether', await getTokenBalance('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'TYaaJsD44isGwQUbvHNuii8nAnTKSxPcND'))
    sdk.util.sumSingleBalance(balances, 'tron', await getTrxBalance('TCdY8kA7XsZ5UUw8jEgbVRbS2MVttrY9AC') / (10 ** 6))
    sdk.util.sumSingleBalance(balances, 'usdd', await getTokenBalance('TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', 'TWupFtHWnURhDNrWBfB2tK3zD4uALurBgk'))
    sdk.util.sumSingleBalance(balances, 'justmoney-2', await getTokenBalance('TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR', 'TK76Z1mJQHN98WsuUUKeDZnNhwRsj6p5wo'))
    
    return balances
}

module.exports = {
    tron: {
        tvl,
    },
};
