const { ordersTvl } = require("./orders");
const { depositsTvl, borrowed } = require("./deposits");
const sdk = require("@defillama/sdk");
const idl = require("./idl.json");

async function tvl() {
  const orders = await ordersTvl();
  const deposits = await depositsTvl();
  const balances = {};
  sdk.util.mergeBalances(balances, orders);
  sdk.util.mergeBalances(balances, deposits);
  return balances;
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed },
};
