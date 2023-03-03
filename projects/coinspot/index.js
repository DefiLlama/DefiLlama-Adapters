const { cexExports } = require('../helper/cex')

const config = {
    ethereum: {
        owners: [
            "0xdb6FDc30AB61C7cCA742D4c13D1b035F3F82019A",
            "0xa9Bd318A4Ca1747E6068D100e18711B529386e29",
            "0xE4b3dD9839ed1780351Dc5412925cf05F07A1939",
            "0x60F9e80D0D40b2958ac39006635dE782096866C3"
        ],
    },
    // polygon: {
    //     owners: {
            
    //     }
    // },
    // bsc: {
    //     owners: {
            
    //     }
    // },
    // optimism: {
    //     owners: {
            
    //     }
    // }

    // BTC addresses are timing out. Will need to investigate.
    // bitcoin: {
    //     owners: [
    //         "1GQdrgqAbkeEPUef1UpiTc4X1mUHMcyuGW"
    //     ],
    // },

}

module.exports = cexExports(config)