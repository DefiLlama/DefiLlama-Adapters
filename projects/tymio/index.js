const config = {
  ethereum: '0xB67D637B1301EEb56Dba4555bBd15Cd220F1aaD6',
  arbitrum: '0xB67D637B1301EEb56Dba4555bBd15Cd220F1aaD6',
};

module.exports = {
  methodology: 'Obtaining all authorized assets on deployed project contracts',
}

Object.keys(config).forEach(chain => {
  const contract = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.fetchList({  lengthAbi: 'acceptableTokensArrayLength', itemAbi: 'acceptableTokensArray', target: contract})
      return api.sumTokens({ tokens, owner: contract })
    }
  }
})