const config = {
    "arbitrum": {
      "AMLP": {
        "token": "0x152f5E6142db867f905a68617dBb6408D7993a4b",
        "staker": "0x3a66b81be26f2d799C5A96A011e1E3FB2BA50999"
      },
      "AHLP": {
        "token": "0x5fd22dA8315992dbbD82d5AC1087803ff134C2c4",
        "staker": "0x1ba274EBbB07353657ed8C76A87ACf362E408D85"
      }
    }
  };module.exports = {
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