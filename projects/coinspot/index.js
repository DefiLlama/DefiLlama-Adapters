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
            "0x867bfA133D64fAd734C89f886D2A169B6504Ab2b",
            "0x56de1961fDA5454E6F8e6D0e3124fF648FD69400",
            "0x32143A02Fb6484D18C79Fa0401c9bF760DD3DE68",
            "0xe6f79f8B46b30f293cfBDe50eF787d2Fe0610782",
            "0x91a0a3043f68986043D7083C4D85B558B21F0A7B",
            "0xa9Bd318A4Ca1747E6068D100e18711B529386e29",
            "0x4207837D4Cd914467EB76bf88c4d6e7Ba11ccDf9",
            "0xDF1553A2130cbAFA70a35e68eFC6cCF67F0A278C",
            "0x32143A02Fb6484D18C79Fa0401c9bF760DD3DE68",
            "0x867bfA133D64fAd734C89f886D2A169B6504Ab2b",
            "0x4207837D4Cd914467EB76bf88c4d6e7Ba11ccDf9",

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