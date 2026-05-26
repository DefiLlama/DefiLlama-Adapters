const { sumTokensExport } = require('../helper/solana');

module.exports = {
    methodology: "Tracks all tokens inside Huma Finance pool authority token accounts",
    doublecounted: true,
    solana: { tvl: sumTokensExport({ owner: '9936VFvgRmW1STvdgeyPQaKHDx5DwBtbhZkT3HcdL3QK', blacklistedTokens: ['59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw']}) }
}