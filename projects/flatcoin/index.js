const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/chain/tron')

const owner = 'TV8ndiKP98SF537BM9XvEbzkY2TerXNzEs'
const token = ADDRESSES.tron.USDT

module.exports = {
    tron: {
        tvl: sumTokensExport({tokensAndOwners: [[token, owner]], }),
    },
}
