const summary = require("../helper/chain/mintlayer").summary;

async function tvl () {
  const data = await summary();
  const total_amount_ml = data.staking.total_amount;
  const ml_price = data.exchange_rate;
  const total_amount_usdt = total_amount_ml * ml_price;
  return {
    tether: total_amount_usdt,
  }
}

module.exports = {
  methodology: "Fetch total staked ML tokens and multiply by the current price of ML to get USDT value.",
  misrepresentedTokens: true,
  mintlayer: {
    tvl,
  },
};
