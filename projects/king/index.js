module.exports = {
  methodology: 'Tokens on the king contract',
}

const config = {
  ethereum: '0x8F08B70456eb22f6109F57b8fafE862ED28E6040',
}

Object.keys(config).forEach(chain => {
  const king = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({  abi: 'address[]:allTokens', target:king })
      return api.sumTokens({ owner: king, tokens })
    }
  }
})