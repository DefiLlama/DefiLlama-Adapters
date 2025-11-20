const { staking } = require("../helper/staking");

module.exports = {
    base: {
        tvl: async () => ({}),
        staking: staking("0x548D3B444da39686d1a6F1544781d154e7cD1EF7", "0x98d0baa52b2d063e780de12f615f963fe8537553"),
    }
}