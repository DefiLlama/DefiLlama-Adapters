// Ratio — social app for prediction markets (uses Privy for auth).
// Add your chain(s) and TVL logic below (e.g. sumTokens2, api.call, or API).

async function tvl(api) {
    return {};
}
  
module.exports = {
    timetravel: false,
    methodology: 'Ratio is a social app for prediction markets (Privy) built on top of Polymarket.',
    polygon: { tvl },
};
  