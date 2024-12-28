const { unknownTombs } = require('../helper/unknownTokens')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = unknownTombs({
  shares: [
    '0x198271b868daE875bFea6e6E4045cDdA5d6B9829', // AFD
    '0x9a3321E1aCD3B9F6debEE5e042dD2411A1742002', // AFP
  ],
  masonry: [
    '0x935B36a774f2c04b8fA92acf3528d7DF681C0297', // AFD
    '0x7993a5a830a158961eff96280538960c875f6807', // Auto pool AFD
    '0x1f8a98be5c102d145ac672ded99c5be0330d7e4f', // Pig Pen
  ],
  rewardPool: [
    '0xac93829C9708664af6B68662b52991b967493CD4',
    '0x8536178222fC6Ec5fac49BbfeBd74CA3051c638f',
    '0xc0e30e8cddae2b5c03f841d4e08cbe22e807426e',
    '0x685bfdd3c2937744c13d7de0821c83191e3027ff',
    '0x5916E7d97671dC0D249F01DfF3790570ED3805e7',
  ],
  chain: 'bsc',
  lps: [
    '0xb5151965b13872b183eba08e33d0d06743ac8132',
    '0xa0feB3c81A36E885B6608DF7f0ff69dB97491b58',
    '0x2139c481d4f31dd03f924b6e87191e15a33bf8b4',
  ],
  useDefaultCoreAssets: true,
})

module.exports.bsc.tvl = sumTokensExport({
  tokensAndOwners: [
    [nullAddress, '0x4c004c4fb925be396f902de262f2817deebc22ec'],
  ],
  chain: 'bsc'
})