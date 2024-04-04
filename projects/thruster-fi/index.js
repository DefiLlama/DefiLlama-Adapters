const sdk = require('@defillama/sdk')
const { uniV3Export } = require("../helper/uniswapV3");
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  uniV3Export({ blast: { factory: "0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127", fromBlock: 157106, }, }),
])

async function excludeYES(api) {
  const YES = '0x20fE91f17ec9080E3caC2d688b4EcB48C5aC3a9C'
  const bal = await api.call({  abi: 'erc20:balanceOf', target: YES, params: '0x1d16788b97eDB7d9a6aE66D5C5C16469037Faa00'})
  api.add(YES, -bal)
  return api.getBalances()
}

module.exports.blast.tvl = sdk.util.sumChainTvls([module.exports.blast.tvl, excludeYES])