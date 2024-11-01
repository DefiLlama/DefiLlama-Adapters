const { sumTokens } = require('../helper/chain/bitcoin')

const staticAddresses = [
    'bc1qndzgrwj3y2lhcklme4t72jxq3df2h05vjdgzpp',
    '19wFRSr3GYHmVQtnmbkx7Wkjw3jZdyYB9a'
]
async function tvl() {
    return sumTokens({ owners: staticAddresses })
}

module.exports = {
    methodology: "enzoBTC, Lorenzo Wrapped Bitcoin",
    bitcoin: {
        tvl: tvl
    }
};