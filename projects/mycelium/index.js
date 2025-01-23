const { gmxExports } = require('../helper/gmx')
const { staking } = require('../helper/staking')

module.exports = {
  methodology: "We count liquidity in Perpetual Swaps based on the value of tokens in the MLP pool.",
  arbitrum: {
    tvl: gmxExports({ vault: '0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855', }),
    staking: staking('0xF9B003Ee160dA9677115Ad3c5bd6BB6dADcB2F93', '0xC74fE4c715510Ec2F8C61d70D397B32043F55Abe')
  },
}