const { uniV3Export } = require('../helper/uniswapV3')

const factory = '0xD84CBf0B02636E7f53dB9E5e45A616E05d710990'
const fromBlock = 12314

module.exports = {
  ...uniV3Export({
    berachain: {
      factory,
      fromBlock,
      permitFailure: true,
      blacklistedTokens: [
        '0x541fd749419ca806a8bc7da8ac23d346f2df8b77',
        '0x1b25ca174c158440621ff96e4b1262cb5cc8942f',
        '0xc3827a4bc8224ee2d116637023b124ced6db6e90',
        '0x93919784c523f39cacaa98ee0a9d96c3f32b593e',
      ],
    }
  })
}