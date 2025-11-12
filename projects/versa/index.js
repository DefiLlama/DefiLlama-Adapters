const { getUniTVL } = require('../helper/unknownTokens')

const FACTORIES = "0x4346A7C8C39Bf91b8a80933c2fdb10d815c401dB"
const tvl = getUniTVL({ factory:FACTORIES, useDefaultCoreAssets: true })

module.exports = {
        methodology: "Versa Tvl Calculation",
    astar: { tvl }
}
