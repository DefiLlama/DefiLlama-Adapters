const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
    arbitrum: {
        tvl: (api) => sumTokens2({ 
            api, 
            owners: [
                '0x8D21dfEA9231Db85dCe72b8d9F18e917d833d4B1', 
                '0xAD3026961087eccEC0508D411bb9fb405E086B38'
            ], 
            fetchCoValentTokens: true 
        })
    }
}