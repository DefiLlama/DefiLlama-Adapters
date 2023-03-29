const utils = require("../helper/utils");

async function tvl() {
  const totalValueLocked = {};
  const url = `https://market-api.openocean.finance/v1/defillama/kava/total_supply`;

  const { data: { result } } = await utils.fetchURL(url);

  for (let token of result) {
    const { symbol, decimals, amount } = token;
    if (!symbol || !decimals) {
      utils.log("unknown token", token);
      continue;
    }

    totalValueLocked[symbol] = parseFloat((Number(amount) / 10 ** decimals).toFixed(2));
  }

  return totalValueLocked;
}

module.exports = {
  timetravel: false,
  kava: { tvl }
};
