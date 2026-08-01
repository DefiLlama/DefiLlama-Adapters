const abi = {
    "trancheFactory": "address:trancheFactory",
    "collateralToken": "function collateralToken() external view returns (address)",
    "tranches": "function tranches(uint256 i) external view returns (address token, uint256 ratio)",
    "instanceCount": "function instanceCount() external view returns (uint256 count)",
    "instanceAt": "function instanceAt(uint256 index) external view returns (address instance)",
    "underlying": "function underlying() external view returns (address)"
  };
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    buttonTokenFactories: [
      "0x84D0F1Cd873122F2A87673e079ea69cd80b51960",
      "0x65bC95AC790F8afd47Fc9b83640Bf722a73BC021",
    ],
    unbuttonTokenFactories: [
      "0x75ff649d6119fab43dea5e5e9e02586f27fc8b8f",
    ],
    fromBlock: 14611058
  },
  avax: {
    buttonTokenFactories: [
      "0x033D23c8371354BF1110001386E97298F48Fc0a9",
    ],
    fromBlock: 35710946
  },
  base: {
    buttonTokenFactories: [
      "0x5f51466C781E74C53c043F441E700d3Bb80373E1",
    ],
    fromBlock: 3839432
  },
  arbitrum: {
    buttonTokenFactories: [
      "0x06fe30a0a8e2ec5c8a9c9643f32aca8db909227f",
    ],
    fromBlock: 185321020
  }
}

Object.keys(config).forEach(chain => {
  const { buttonTokenFactories, unbuttonTokenFactories } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {

      // Collecting all the wrapper tokens
      const calls = [];

      // Add all the button tokens to calls array
      for (const buttonTokenFactory of buttonTokenFactories || []) {
        const buttonTokenCount = await api.call({ abi: abi.instanceCount, target: buttonTokenFactory });
        for (let i = 0; i < buttonTokenCount; i++) {
          calls.push({ target: buttonTokenFactory, params: i });
        }
      }

      // Add all the unbutton tokens to calls array
      for (const unbuttonTokenFactory of unbuttonTokenFactories || []) {
        const unbuttonTokenCount = await api.call({ abi: abi.instanceCount, target: unbuttonTokenFactory });
        for (let i = 0; i < unbuttonTokenCount; i++) {
          calls.push({ target: unbuttonTokenFactory, params: i });
        }
      }

      // Fetching the wrapper token instances
      const wrapperTokens = await api.multiCall({ abi: abi.instanceAt, calls });

      // Fetching the underlying of each wrapper token
      const underlyingTokens = await api.multiCall({ abi: abi.underlying, calls: wrapperTokens })

      // Fetching the underlying balance of each wrapper token and summing the total
      return sumTokens2({ api, tokensAndOwners2: [underlyingTokens, wrapperTokens], })
    }
  }
})
