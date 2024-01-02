const { getAPI, addTokenBalance } = require('../helper/acala/interlay-api');

// for exchange rate decoding
const FIXEDI128_SCALING_FACTOR = 18;

async function tvl() {
  const chain = "interlay";
  const api = await getAPI(chain);
  const balances = {};
  
  const data = (await api.query.loans.markets.entries());

  for (let i = 0; i < data.length; i++) {
    const [underlyingId, marketData] = data[i];

    const isActive = marketData?.toJSON().state == "Active";
    if (!isActive) {
      continue;
    }

    const lendTokenId = marketData.toJSON().lendTokenId;

    const [exchangeRate, totalIssuance] = Promise.all([
      api.query.loans.exchangeRate(underlyingId).then((rawExchangeRate) => {
        parseInt(rawExchangeRate) / (10 ** FIXEDI128_SCALING_FACTOR);
      }),
      api.query.tokens.totalIssuance(lendTokenId)
    ]);

    const atomicAmount = totalIssuance * exchangeRate;
    addTokenBalance({ balances, chain, atomicAmount, ccyArg: underlyingId });
  }

  return balances;
}


module.exports = {
  timetravel: false,
  methodology: "Tracks TVL for Interlay's lending protocol.",
  interlay: { tvl }
};
