const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/tron')

const owner = 'TV8ndiKP98SF537BM9XvEbzkY2TerXNzEs'
const token = ADDRESSES.tron.USDT

async function tvl() {
    return sumTokens({ tokensAndOwners: [[token, owner]], })
}

module.exports = {
    tron: {
        tvl,
    },
}
