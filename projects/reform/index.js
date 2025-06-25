const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking('0x74ef3b69e8c475df8450eddda5dabd9b6dd17972', '0xea3eed8616877F5d3c4aEbf5A799F2e8D6DE9A5E'),
    pool2: staking('0x74ef3b69e8c475df8450eddda5dabd9b6dd17972', '0xf4e14a7766a3316d6cefbaec614c714f2d4965d8')
  }
}
