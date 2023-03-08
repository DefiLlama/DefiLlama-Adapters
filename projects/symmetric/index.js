const sdk = require('@defillama/sdk');
const { v1Tvl, onChainTvl } = require('../helper/balancer')

module.exports = {
  celo: {
    tvl: sdk.util.sumChainTvls([
      v1Tvl('0x6C2e59C3cCB1d81c0eC9Fb9d4d6a3CC3488Fd71c', 6759199),
      onChainTvl('0xE9265892B5c56264d60e26451862B576814185C9', 11764404),
    ])
  },
  xdai: {
    tvl: sdk.util.sumChainTvls([
      v1Tvl('0x9B4214FD41cD24347A25122AC7bb6B479BED72Ac', 16465037),
      onChainTvl('0x901E0dC02f64C42F73F0Bdbf3ef21aFc96CF50be', 21343993),
    ])
  },
  kava: {
    tvl: onChainTvl('0xA18808989E7EB0FcF0932fd00D007F3C118B78E7', 551649),
  }
}
