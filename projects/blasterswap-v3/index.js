const sdk = require('@defillama/sdk')
const { uniV3Export } = require("../helper/uniswapV3");
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
	uniV3Export({ blast: { factory: "0x1A8027625C830aAC43aD82a3f7cD6D5fdCE89d78", fromBlock: 4308657, }, }),
])

module.exports.blast.tvl = sdk.util.sumChainTvls([module.exports.blast.tvl])
