const { onChainTvl } = require('../helper/balancer')

module.exports = {
  avax: {
    tvl: onChainTvl('0xad68ea482860cd7077a5d0684313dd3a9bc70fbb', 8169253)
  },
}