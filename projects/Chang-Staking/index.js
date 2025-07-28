const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  changchain: {
    tvl: staking({
      owner: '0x0e6cF7C13aB088fBb216Db1DD768E622f838a382', 
      tokens: ['0x0000000000000000000000000000000000000000'], 
      chain: 'changchain'
