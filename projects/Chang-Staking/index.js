const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  changchain: {
    tvl: staking({
      owner: '0x2D49b31631f74FcADD9f9c0464db4D3Db30Cb11f', 
      tokens: ['0x0e6cF7C13aB088fBb216Db1DD768E622f838a382'], 
      chain: 'changchain'
      
