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
};

async function tvl() {
  const balances = {};

  const { zones } = await get(
    endPoints.quicksilver + "/quicksilver/interchainstaking/v1/zones"
  );
  const { supply } = await get(
    endPoints.quicksilver + "/cosmos/bank/v1beta1/supply"
  );

  zones.map((zone) => {
    const balance = supply.find((coin) => {
      return coin.denom === zone.local_denom;
    });
    let amount = balance.amount / 1e6;
    if (zone.base_denom === "adydx")
      amount = balance.amount / 1e18

    const id = coinGeckoIds[zone.base_denom]
    if (!id) {
      throw new Error("Missing CoinGecko ID for denom " + zone.base_denom);
    }

    sdk.util.sumSingleBalance(
      balances,
      id,
      amount * zone.redemption_rate
    );
  });

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on Quicksilver",
  quicksilver: {
    tvl,
  },
}; // node test.js projects/quicksilver/index.js
