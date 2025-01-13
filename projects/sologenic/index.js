const { fetchURL } = require('../helper/utils')

const tvl = async (api) => {
    const balance= await sumCurrencyBalance()
    api.add("sologenic",balance);
};

const sumCurrencyBalance = async () => {
    const currency = "SOLO";
    const url = 'https://apiv2.sologenic.org/amm/search?currency='+currency;
    const headers = { "network": "mainnet" };
  
    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
    
        // Ensure Trades array is present
        if (!data.Trades || !Array.isArray(data.Trades)) {
            throw new Error("Invalid response: Trades array missing");
        }
  
        // Sum the CurrencyBalanceVal corrected for the exponent
        const bal1 = data.Trades
            .filter(trade => trade.Currency === currency) // Filter trades by matching currency
            .reduce((sum, trade) => {
                if (trade.CurrencyBalanceVal==undefined) {
                    return sum
                }
                let balance = trade.CurrencyBalanceVal
                if (trade.CurrencyBalanceExp!=undefined) {
                    balance = trade.CurrencyBalanceVal * Math.pow(10, trade.CurrencyBalanceExp);
                }
                return sum + balance;
            }, 0);
        // Sum the CurrencyBalanceVal corrected for the exponent
        const bal2 = data.Trades
            .filter(trade => trade.Currency2 === currency) // Filter trades by matching currency
            .reduce((sum, trade) => {
            if (trade.CurrencyBalanceVal2==undefined) {
                return sum
            }
            let balance = trade.CurrencyBalanceVal2
            if (trade.CurrencyBalanceExp2!=undefined) {
                balance = trade.CurrencyBalanceVal2 * Math.pow(10, trade.CurrencyBalanceExp2);
            }
            return sum + balance;
            }, 0);
        return bal1 + bal2;
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      return null;
    }
}

module.exports = {
    timetravel: false,
    methodology: "TVL is the sum of deposits into the Liquidity pools",
    ripple: { tvl },
}