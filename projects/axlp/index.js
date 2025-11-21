const config = require('./config.json')

module.exports = {
  methodology: 'counts the number of AMLP and AHLP tokens in the staking contracts.',
  arbitrum: {
    tvl: async (api) => {
      const [amlp_staker_balance, ahlp_staker_balance] = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: [
          { target: config.arbitrum.AMLP.token, params: [config.arbitrum.AMLP.staker] },
          { target: config.arbitrum.AHLP.token, params: [config.arbitrum.AHLP.staker] }
        ]
      })
      api.add(config.arbitrum.AMLP.token, amlp_staker_balance)
      api.add(config.arbitrum.AHLP.token, ahlp_staker_balance)
    }
  }
}