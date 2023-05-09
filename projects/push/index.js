const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: () => 0,
    pool2: staking('0xb72ff1e675117bedeff05a7d0a472c3844cfec85', '0xaf31fd9c3b0350424bf96e551d2d1264d8466205'),
    staking: staking('0xb72ff1e675117bedeff05a7d0a472c3844cfec85', '0xf418588522d5dd018b425e472991e52ebbeeeeee'),
  }
}