const {getCompoundUsdTvl} = require('../helper/compound')

const unitroller = "0xD5B649c7d27C13a2b80425daEe8Cb6023015Dc6B"
// node test.js projects/neku/index.js
module.exports={
    arbitrum:{
        tvl: getCompoundUsdTvl(unitroller, "arbitrum", "0xBC4a19345c598D73939b62371cF9891128ecCB8B")
    },
    moonriver:{
        tvl: getCompoundUsdTvl(unitroller, "moonriver", "0xBC4a19345c598D73939b62371cF9891128ecCB8B")
    },
    bsc:{
        tvl: getCompoundUsdTvl(unitroller, "bsc", "0xBC4a19345c598D73939b62371cF9891128ecCB8B")
    }
}