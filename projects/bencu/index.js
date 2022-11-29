const {usdCompoundExports} = require("../helper/compound")

module.exports={
    misrepresentedTokens: true,
    metis:usdCompoundExports("0xC5986Df018D1ff8ecA79fd3f266428616617cDF3", "metis", undefined, undefined, {
        blacklist: ['0x718F2e019F8166d81523d959F720Ad4A6e379209'.toLowerCase()]
    })
}