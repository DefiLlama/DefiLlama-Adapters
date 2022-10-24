const { gmxExports } = require('../helper/gmx')
const { staking } = require('../helper/staking')

module.exports = {
  methodology: "We count liquidity in Perpetual Swaps based on the value of tokens in the MLP pool.",
  arbitrum: {
    tvl: gmxExports({ chain: 'arbitrum', vault: '0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855', }),
    staking: staking('0x9B225FF56C48671d4D04786De068Ed8b88b672d6', '0xC74fE4c715510Ec2F8C61d70D397B32043F55Abe', 'arbitrum')
  },
}