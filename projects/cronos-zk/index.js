const { sumTokens2 } = require("../helper/unwrapLPs");

const target = "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB"
const gasQuery = '0x0000000000000000000000000000000000000001'
const gasAddress = '0x0000000000000000000000000000000000000000'
const chainId = 388

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const totalBalances = await sumTokens2({
        api,
        owner: target,
        fetchCoValentTokens: true,
      })
      const balances = await api.multiCall({
        calls: [gasQuery, ...Object.keys(totalBalances)].map(token => ({
          target, params: [chainId, token.substring(token.indexOf(':') + 1)]
        })),
        abi: { "inputs": [{ "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "l1Token", "type": "address" }], "name": "chainBalance", "outputs": [{ "internalType": "uint256", "name": "balance", "type": "uint256" }], "stateMutability": "view", "type": "function" },
        permitFailure: true,
        withMetadata: true
      })
      api._balances._balances = {}
      balances.map(call => {
        const token = call.input.params[1]
        api.add(token == gasQuery ? gasAddress : token, call.output)
      })
    }
  },
};
