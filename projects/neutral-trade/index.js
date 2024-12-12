const { VAULTS, START_TIMESTAMP } = require("./constants");

async function fetchHistoricalTvl(vault, date) {
  let usd_tvl = 0;
  let token_tvl = 0;
  try {
    const response = await fetch(vault.dataUrl);
    const all = Object.entries(await response.json());
    for (let i = 0; i < all.length; i++) {
      const [entryTime, entryData] = all[i];
      usd_tvl = entryData?.TVL_USD;
      token_tvl = entryData?.TVL_TOKEN;
      if (entryTime?.startsWith(date)) {
        break;
      }
    }
    usd_tvl = usd_tvl || 0;
    token_tvl = (token_tvl || 0) * Math.pow(10, vault.token.decimals);
  } catch (_e) {
    console.log(_e);
  }
  return { usd_tvl, token_tvl };
}

async function tvl(api) {
  const ts = new Date(api.timestamp * 1000);
  const year = ts.getFullYear();
  const month = String(ts.getMonth() + 1).padStart(2, '0');
  const day = String(ts.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  for (let i = 0; i < VAULTS.length; i++) {
    const { token_tvl } = await fetchHistoricalTvl(VAULTS[i], date);
    api.add(VAULTS[i].token.mint, token_tvl);
  }
}

module.exports = {
  start: START_TIMESTAMP,
  timetravel: true,
  methodology: "The combined TVL and PnL of all public and private vaults ; the historical data is pulled from the Neutral.trade vaults data repository.",
  solana: { tvl },
};
