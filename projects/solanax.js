const { get } = require('./helper/http')
const { toUSDTBalances } = require('./helper/balances');

async function fetch() {
  const response = (
    await get("https://solanax.org/api/data/")
    )

  const tvl = response.total_locked;

  return toUSDTBalances(tvl);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `TVL is fetched by making calls to the Solanax API (https://solanax.org/api/data/)`,
  solana: {
      tvl: () => ({}),
  }
  
};