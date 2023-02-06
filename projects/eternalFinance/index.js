const { lyfTvl } = require("./lyf");
const { lendingTvl } = require("./lending");
const { default: BigNumber } = require("bignumber.js");

async function tvl() {
    const lyf = await lyfTvl();
    const lending = await lendingTvl();
    /// @dev aggregate tvl from lending and farming
    Object.keys(lending).forEach((key) => {
        const tvlFromLyf = lyf[key] || '0';
        lyf[key] = new BigNumber(lending[key]).plus(tvlFromLyf).toFixed();
    })

    return lyf
}

module.exports = {
    start: 1675411748,
    aptos: {
        tvl,
    }
}