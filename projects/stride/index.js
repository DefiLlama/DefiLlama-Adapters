const utils = require("../helper/utils");
const sdk = require('@defillama/sdk')

const coinGeckoIds = {
  uatom: "cosmos",
  ustars: "stargaze",
  ujuno: "juno-network",
  uosmo: "osmosis",
};

async function tvl() {
  const balances = {}
  const {
    data: { HostZone: hostZones },
  } = await utils.fetchURL(
    "https://stride-library.main.stridenet.co/api/Stride-Labs/stride/stakeibc/host_zone"
  );

  const {
    data: { supply: assetBalances },
  } = await utils.fetchURL(
    "https://stride-fleet.main.stridenet.co/api/cosmos/bank/v1beta1/supply"
  );

  hostZones.map((hostZone) => {
    const assetBalance = assetBalances.find((asset) => {
      return asset.denom === `st${hostZone.HostDenom}`;
    });

    const amount = assetBalance.amount / 1_000_000;

    sdk.util.sumSingleBalance(balances, coinGeckoIds[hostZone.HostDenom], amount * hostZone.RedemptionRate)
  });

  return balances
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on Stride",
  stride: {
    tvl,
  },
}; // node test.js projects/stride/index.js
