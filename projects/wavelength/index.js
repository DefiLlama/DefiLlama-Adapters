
const { onChainTvl } = require('../helper/balancer')

module.exports = {
  velas:{
    tvl: onChainTvl('0xa4a48dfcae6490afe9c779bf0f324b48683e488c', 56062385, { onlyUseExistingCache: true, })
  },
}