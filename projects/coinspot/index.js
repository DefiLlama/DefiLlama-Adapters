const { cexExports } = require('../helper/cex')

const config = {
    ethereum: {
        owners: [
            "0xdb6FDc30AB61C7cCA742D4c13D1b035F3F82019A",
            "0xa9Bd318A4Ca1747E6068D100e18711B529386e29",
            "0xE4b3dD9839ed1780351Dc5412925cf05F07A1939",
            "0x60F9e80D0D40b2958ac39006635dE782096866C3",
            "0x916ED5586bB328E0eC1a428af060DC3D10919d84",
            "0x33A64dcDfa041bEfebC9161a3e0c6180cd94Fa89",
        ],
    },
    polygon: {
        owners: [
            "0x916ED5586bB328E0eC1a428af060DC3D10919d84"
        ],
    },
    bsc: {
        owners: [
            "0x33A64dcDfa041bEfebC9161a3e0c6180cd94Fa89"
        ],
    },
    fantom: {
        owners: [
            "0x33A64dcDfa041bEfebC9161a3e0c6180cd94Fa89"
        ],
    },
    // doge isn't supported
    // dogechain: {
    //     owners: [
    //         "D9GqmkGCpgtnXP7xMD78v9xfqeDkqBZBMT"
    //     ],
    // },

    // BTC addresses are timing out. Will need to investigate.
    // bitcoin: {
    //     owners: [
    //         "1GQdrgqAbkeEPUef1UpiTc4X1mUHMcyuGW"
    //     ],
    // },

}

module.exports = cexExports(config)