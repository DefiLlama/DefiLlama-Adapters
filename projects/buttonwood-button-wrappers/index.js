const abi = require('./abi.json');
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    buttonTokenFactory: "0x84D0F1Cd873122F2A87673e079ea69cd80b51960",
    unbuttonTokenFactory: "0x75ff649d6119fab43dea5e5e9e02586f27fc8b8f",
    fromBlock: 14611058
  },
  avax: {
    buttonTokenFactory: "0x033D23c8371354BF1110001386E97298F48Fc0a9",
    fromBlock: 35710946
  },
  base: {
    buttonTokenFactory: "0x5f51466C781E74C53c043F441E700d3Bb80373E1",
    fromBlock: 3839432
  },
}

Object.keys(config).forEach(chain => {
  const { buttonTokenFactory, unbuttonTokenFactory } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {

      // Get buttton-token count
      const buttonTokenCount = buttonTokenFactory ? await api.call({ abi: abi.instanceCount, target: buttonTokenFactory }) : 0;

      // Get unbutton-token count
      const unbuttonTokenCount = unbuttonTokenFactory ? await api.call({ abi: abi.instanceCount, target: unbuttonTokenFactory }) : 0;

      // Collecting all the wrapper tokens
      const calls = [];
      for (let i = 0; i < buttonTokenCount; i++) {
        calls.push({ target: buttonTokenFactory, params: i });
      }
      for (let i = 0; i < unbuttonTokenCount; i++) {
        calls.push({ target: unbuttonTokenFactory, params: i });
      }
      const wrapperTokens = await api.multiCall({ abi: abi.instanceAt, calls });

      // Fetching the underlying of each wrapper token
      const underlyingTokens = await api.multiCall({ abi: abi.underlying, calls: wrapperTokens })

      // Fetching the underlying balance of each wrapper token and summing the total
      return sumTokens2({ api, tokensAndOwners2: [underlyingTokens, wrapperTokens], })
    }
  }
})
