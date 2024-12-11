const { VAULTS, START_TIMESTAMP } = require("./constants");

async function fetchHistoricalTvl(vault, date) {
  let usd = 0;
  let token = 0;
  try {
    const response = await fetch(vault.dataUrl);
    const all = await response.json();
    const [, atDate] = Object.entries(all).find(([entryDate,]) => {
      return entryDate.startsWith(date);
    });
    usd = atDate?.TVL_USD || 0;
    token = atDate?.TVL_TOKEN || 0;
  } catch (_e) { }
  return { usd, token };
}

async function tvl(api) {
  const ts = new Date(api.timestamp * 1000);
  const year = ts.getFullYear();
  const month = String(ts.getMonth() + 1).padStart(2, '0');
  const day = String(ts.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  for (let i = 0; i < VAULTS.length; i++) {
    const { token } = await fetchHistoricalTvl(VAULTS[i], date);
    api.add(VAULTS[i].token.mint, token * Math.pow(10, VAULTS[i].token.decimals));
  }
}

module.exports = {
  start: START_TIMESTAMP,
  timetravel: true,
  methodology: "The combined TVL and PnL of all public and private vaults ; the historical data is pulled from the Neutral.trade vaults data repository.",
  solana: { tvl },
};
