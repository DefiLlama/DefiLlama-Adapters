const { getCompoundV2Tvl } = require('../helper/compound')

module.exports = {
    optimism: {
        tvl: getCompoundV2Tvl("0x91c471053bA4697B13d62De1E850Cc89EbE23633", "optimism"),
        borrowed: ()=>({})
    },
    arbitrum: {
        tvl: getCompoundV2Tvl("0x91c471053bA4697B13d62De1E850Cc89EbE23633", "arbitrum"),
        borrowed: ()=>({})
    }
}
