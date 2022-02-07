const { getTokenAccountBalance } = require("../helper/solana");

const tvl = async () => {
    const [solana] = await Promise.all([
        getTokenAccountBalance('3ghzHYHC7nXx11DEq7aGNHwTyT3SWmCs1B2Ay7HB8ZCk')
    ])
    return {
        solana
    }
}

module.exports = {
    solana: {
        tvl
    },
}
