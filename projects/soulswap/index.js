const {calculateUsdSoulTvl} = require('./helper/getUsdSoulTvl.js')

const factory = '0x1120e150dA9def6Fe930f4fEDeD18ef57c0CA7eF'
const ftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const whitelist = [
  '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // usdc
  '0xe2fb177009ff39f52c0134e8007fa0e4baacbd07', // soul
  '0x49ac072c793fb9523f0688a0d863aadfbfb5d475', // rndm
  '0x321162cd933e2be498cd2267a90534a804051b11' // btc
]


module.exports = {
  misrepresentedTokens: true,
  methodology: "Counts liquidity on the exchange",
  tvl: calculateUsdSoulTvl(factory, 'fantom', ftm, whitelist, 'fantom')
}
