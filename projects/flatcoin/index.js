const { sumTokens } = require('../helper/chain/tron')

const owner = 'TV8ndiKP98SF537BM9XvEbzkY2TerXNzEs'
const token = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

async function tvl() {
    return sumTokens({ tokensAndOwners: [[token, owner]], })
}

module.exports = {
    tron: {
        tvl,
    },
}
