const { sumTokens } = require('../helper/chain/bitcoin')

const staticAddresses = [
    'bc1qnvgmve5gs89ugf4n94jzqgan202dve5dtrj220',
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