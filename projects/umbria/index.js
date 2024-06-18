const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

module.exports = {
  ethereum: {
    tvl: () => ({}),
    pool2: pool2('0xdF9401225cC62d474C559E9c4558Fb193137bCEB', '0xA76aE94659B6B53c5e85D37fBDd36aDCb7635b23'),
    staking: staking('0xdF9401225cC62d474C559E9c4558Fb193137bCEB', '0xa4bbe66f151b22b167127c770016b15ff97dd35c'),
  },
  polygon: {
    tvl: () => ({}),
    pool2: pool2('0x3756a26De28d6981075a2CD793F89e4Dc5A0dE04', '0x9c8c16cd2a7a695ae30920ee4c3f558893665c55'),
    staking: staking('0x3756a26De28d6981075a2CD793F89e4Dc5A0dE04', '0x2e4b0fb46a46c90cb410fe676f24e466753b469f'),
  },
} 