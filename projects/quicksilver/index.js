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
  aarch: "archway",
  ppica: "picasso",
  uflix: "omniflix-network",
  inj: "injective",
};

async function tvl() {
  const balances = {};
  const { zones } = await get(endPoints.quicksilver + "/quicksilver/interchainstaking/v1/zones");
  const { supply } = await get(endPoints.quicksilver + "/cosmos/bank/v1beta1/supply");

  zones.forEach((zone) => {
    const balance = supply.find((coin) => coin.denom === zone.local_denom);
    if (!balance) return
    const amount = balance.amount / Math.pow(10, zone.decimals)
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
