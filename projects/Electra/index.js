async function tvl(api) {
  const { lumia: lumiaTvl } = await (await fetch('https://app.electra.trade/frontage/api/v1/statistics/defilama/tvl')).json();

  api.addUSDValue(lumiaTvl);
}

module.exports = {
  methodology: `Total client deposits + Unrealized PnL of clients + Company's own funds + Broker's deposit on Binance`,
  timetravel: false,
  misrepresentedTokens: true,
  lumia: {
    tvl,
  }
}; 