const { onChainTvl } = require('../helper/balancer')

module.exports = {
  aurora: {
    tvl: onChainTvl('0x364d44dFc31b3d7b607797B514348d57Ad0D784E', 78113009)
  },
}