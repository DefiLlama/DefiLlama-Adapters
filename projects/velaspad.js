const { staking } = require('./helper/staking')

module.exports = {
  velas: {
    tvl: async _ => ({}),
    staking: staking('0xdb0422A1C78C2064Ce5Af1B75412294F5B6D7Edf', '0xa065e0858417dfc7abc6f2bd4d0185332475c180')
  }
}