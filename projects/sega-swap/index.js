const { sumTokens2 } = require('../helper/solana');

module.exports = {
  timetravel: false,
  solana: {
    tvl: (api) => sumTokens2({ api, owner: '7PxeEreoLLMewXcGMivzhiWJjgJgA1LcRWBtQEEjwVcr', blacklistedTokens: [
      'yUhpNw2z3Czu7ZgS71eskRaefjTKFPPshgPQuXoJTe6',
      '9csnYtcZ2BysFmtZV52jxQcbbqyfcpn3ubXwdAXrJNuH',
    ]}),
  },
}
