const { staking } = require('../helper/staking')



module.exports = {
  methodology: 'TVL counts staked PREMIO coins on the platform itself. CoinGecko is used to find the price of tokens in USD.',
  celo: {
    staking: staking('0x1DA2C9f15E2399960032dCF709B873712626ABF1', '0x94140c2ea9d208d8476ca4e3045254169791c59e')
  },
  kava: {
    tvl:() => 0,
    staking: staking('0x0281CBD3e40Ce01b514360a47BdB4dB26Dd76bc3', '0x9B82ee2C5e811d9849D7766edC3D750d9ab6492c')
  },
};

