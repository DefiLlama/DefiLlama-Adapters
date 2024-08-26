const sdk = require("@defillama/sdk");
const { transformBalances } = require("../helper/portedTokens");

const { default: axios } = require("axios")


async function _getResources() {
  const res = await axios.post('https://api.mainnet.aptoslabs.com/v1/view', {
    "function": "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::pool_data_provider::get_all_reserves_tokens",
    "type_arguments": [],
    "arguments": []
  });

  return res.data
}

async function _getTokenSupply(token_address) {
  const res = await axios.post('https://api.mainnet.aptoslabs.com/v1/view', {
    "function": "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::pool_data_provider::get_a_token_total_supply",
    "type_arguments": [],
    "arguments": [token_address]
  });
  return res.data
}
  async function _getTokenDebt(token_address) {
    const res = await axios.post('https://api.mainnet.aptoslabs.com/v1/view', {
      "function": "0xeab7ea4d635b6b6add79d5045c4a45d8148d88287b1cfa1c3b6a4b56f46839ed::pool_data_provider::get_total_debt",
      "type_arguments": [],
      "arguments": [token_address]
    });

    return res.data
  }

module.exports = {
  aptos: {
    tvl: async () => {
      const balances = {};
      const data = await _getResources()
      const coinContainers = []
      for (const item of data[0]) {
        const tokenSupply = await _getTokenSupply(item.token_address)
        coinContainers.push({
          lamports: tokenSupply[0],
          tokenAddress: item.token_address
        })
      }
      coinContainers.forEach(({ lamports, tokenAddress }) => {
        sdk.util.sumSingleBalance(balances, tokenAddress, lamports);
      });
      return transformBalances("aptos", balances);
    },
    borrowed: async () => {
      const balances = {};
      const data = await _getResources()
      const coinContainers = []
      for (const item of data[0]) {
        const tokenDebt = await _getTokenDebt(item.token_address)
        coinContainers.push({
          lamports: tokenDebt[0],
          tokenAddress: item.token_address
        })
      }
      coinContainers.forEach(({ lamports, tokenAddress }) => {
        sdk.util.sumSingleBalance(balances, tokenAddress, lamports);
      });
      return transformBalances("aptos", balances);
    },
  },
};
