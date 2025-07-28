const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  changchain: {
    tvl: staking({
      owner: '0x2D49b31631f74FcADD9f9c0464db4D3Db30Cb11f', 
      tokens: ['0x0000000000000000000000000000000000000000'], 
      chain: 'changchain'
      
