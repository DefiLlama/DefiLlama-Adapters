const { getAPI, addTokenBalance } = require('../helper/acala/interlay-api');

// for exchange rate decoding
const FIXEDI128_SCALING_FACTOR = 18;

async function getBalances() {
  const chain = "interlay";
  const api = await getAPI(chain);
  const tvlBalances = {};
  const borrowedBalances = {};
  
  const data = await api.query.loans.markets.entries();

  for (let i = 0; i < data.length; i++) {
    const [storageKey, marketData] = data[i];

    const marketJson = marketData?.toJSON();
    const isActive = marketJson?.state === "Active";
    if (!isActive) continue;

    const lendTokenId = marketJson.lendTokenId;

    const currencyId = storageKey.args[0];

    const [rawExchangeRate, totalIssuanceCodec, totalBorrowsCodec] = await Promise.all([
      api.query.loans.exchangeRate(currencyId),
      api.query.tokens.totalIssuance(lendTokenId),
      api.query.loans.totalBorrows(currencyId),
    ]);

    const issuanceExchangeRate = Number(rawExchangeRate.toString()) / (10 ** FIXEDI128_SCALING_FACTOR);

    const totalIssuance = Number(totalIssuanceCodec.toString());
    const totalBorrows = Number(totalBorrowsCodec.toString());

    const totalTvl = totalIssuance * issuanceExchangeRate - totalBorrows;

    addTokenBalance({ balances: tvlBalances, chain, atomicAmount: totalTvl, ccyArg: currencyId });
    addTokenBalance({ balances: borrowedBalances, chain, atomicAmount: totalBorrows, ccyArg: currencyId });
  }

  return { tvl: tvlBalances, borrowed: borrowedBalances };
}

module.exports = {
  timetravel: false,
  methodology: "Tracks TVL and borrowed amounts for Interlay's lending protocol.",
  interlay: {
    tvl: async () => (await getBalances()).tvl,
    borrowed: async () => (await getBalances()).borrowed,
  },
};
