const { getAPI, addTokenBalance } = require('../helper/acala/interlay-api');

// for exchange rate decoding
const FIXEDI128_SCALING_FACTOR = 18;

async function getBalances() {
  const chain = "interlay";
  const api = await getAPI(chain);
  const tvlBalances = {};
  const borrowedBalances = {};
  
  const data = (await api.query.loans.markets.entries());

  for (let i = 0; i < data.length; i++) {
    const [underlyingId, marketData] = data[i];

    const isActive = marketData?.toJSON().state == "Active";
    if (!isActive) {
      continue;
    }

    const lendTokenId = marketData.toJSON().lendTokenId;
    
    const [issuanceExchangeRate, totalIssuance, totalBorrows]  = await Promise.all([
      api.query.loans.exchangeRate(underlyingId.toHuman()[0]).then((rawExchangeRate) => 
        parseInt(rawExchangeRate) / (10 ** FIXEDI128_SCALING_FACTOR)
      ),
      api.query.tokens.totalIssuance(lendTokenId),
      api.query.loans.totalBorrows(underlyingId.toHuman()[0]),
    ]);

    const totalTvl = (totalIssuance * issuanceExchangeRate) - totalBorrows;
    addTokenBalance({ balances: tvlBalances, chain, atomicAmount: totalTvl, ccyArg: underlyingId.__internal__args[0] });

    addTokenBalance({ balances: borrowedBalances, chain, atomicAmount: totalBorrows, ccyArg: underlyingId.__internal__args[0] });
  }

  return {
    tvl: tvlBalances,
    borrowed: borrowedBalances,
  };
}

module.exports = {
  timetravel: false,
  methodology: "Tracks TVL and borrowed amounts for Interlay's lending protocol.",
  interlay: {
    tvl: async () => (await getBalances()).tvl,
    borrowed: async () => (await getBalances()).borrowed,
  },
};
