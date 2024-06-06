const sdk = require('@defillama/sdk')
const { uniV3Export } = require("../helper/uniswapV3");
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
	uniV3Export({ blast: { factory: "0xb7a92633Bc7074c8216Dc53566fD58A77b5D32D9", fromBlock: 4308657, }, }),
])

module.exports.blast.tvl = sdk.util.sumChainTvls([module.exports.blast.tvl])
