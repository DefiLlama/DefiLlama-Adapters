const {getTokenBalance} = require('../helper/tron')

async function tvl() {
    const [trxAmount, usdtAmount] = await Promise.all([
        getTokenBalance("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", "TE2RzoSV3wFK99w6J9UnnZ4vLfXYoxvRwP"),
        getTokenBalance("TXJgMdjVX5dKiQaUi9QobwNxtSQaFqccvd", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),


    ])
    return {
        'tron': trxAmount,
        'tether': usdtAmount,

    }
}

module.exports = {
    tvl,
}