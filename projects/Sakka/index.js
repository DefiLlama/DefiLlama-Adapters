const vaultUtils_bsc = require("./utils_bsc")
const vaultUtils_klay = require("./utils_klay")

module.exports = {
    bsc: {
        tvl: vaultUtils_bsc.bsc.tvl,
        pool2: vaultUtils_bsc.bsc.pool2,
    },
    klaytn: {
        tvl: vaultUtils_klay.klaytn.tvl,
        pool2: vaultUtils_klay.klaytn.pool2,
    }
};