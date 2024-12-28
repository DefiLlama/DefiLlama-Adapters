const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const { endPoints } = require("../helper/chain/cosmos");

const coinGeckoIds = {
  adydx: "dydx-chain",
  uatom: "cosmos",
  uosmo: "osmosis",
  usomm: "sommelier",
  uregen: "regen",
  ujuno: "juno-network",
  ustars: "stargaze",
  usaga: "saga-2",
  ubld: "agoric",
  utia: "celestia",
};

async function tvl() {
  const balances = {};
  const { zones } = await get(endPoints.quicksilver + "/quicksilver/interchainstaking/v1/zones");
  const { supply } = await get(endPoints.quicksilver + "/cosmos/bank/v1beta1/supply");

  zones.forEach((zone) => {
    const balance = supply.find((coin) => coin.denom === zone.local_denom);
    if (!balance) return
    const amount = zone.base_denom === "adydx" ? balance.amount / 1e18 : balance.amount / Math.pow(10, 6)
    const id = coinGeckoIds[zone.base_denom]
    sdk.util.sumSingleBalance(balances, id, amount * zone.redemption_rate);
  });

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on Quicksilver",
  quicksilver: { tvl },
};
