const {sumTokensExport} = require('../helper/unwrapLPs')

const maitFarm = '0x539618aa29c95c28c0b04abb9025815c014a9db9'

module.exports = {
    polygon: {
        tvl: sumTokensExport({ owners: [maitFarm,], fetchCoValentTokens: true,  })
    },
    deadFrom: '2020-01-01'
}
