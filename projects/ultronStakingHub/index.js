const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  ultron: {
    tvl: () => ({}),
    staking: staking({
      owner: '0xd130811147bb87f313c555e5281b94b9e71b480a', 
      tokens: ['0x3a4F06431457de873B588846d139EC0d86275d54'], 
      chain: 'ultron'
    })
  }
};