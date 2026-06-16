const axios = require('axios')

module.exports = {
  timetravel: false,
  methodology: "Tracks the circulating supply of USDCx on Aleo using Circle's xReserve API, which reports the USDC balance reserved for Aleo (chain ID 10002). USDCx is backed 1:1 by USDC.",
  aleo: {
    tvl: async (api) => {
      const { data } = await axios.get('https://xreserve-api.circle.com/v1/balances/10002', { timeout: 5000 })
      if (!Array.isArray(data?.balances)) throw new Error('Unexpected response from Circle xReserve API')
      const usdcEntry = data.balances.find(b => b.token === 'USDC')
      if (!usdcEntry) throw new Error('USDC balance not found in Circle xReserve API response')
      api.addCGToken('usd-coin', Number(usdcEntry.balance))
      return api.getBalances()
    }
  }
}
