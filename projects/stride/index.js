const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");

const coinGeckoIds = {
  uatom: "cosmos",
  ustars: "stargaze",
  ujuno: "juno-network",
  uosmo: "osmosis",
  uluna: "terra-luna-2",
  aevmos: "evmos",
  inj: "injective-protocol",
  uumee: "umee",
  ucmdx: "comdex",
};

function getCoinDenom(denom) {
  // inj uses 1e18 - https://docs.injective.network/learn/basic-concepts/inj_coin#base-denomination
  const idArray = ['aevmos', 'inj'];

  if (idArray.includes(denom)) {
    return 1e18;
  } else {
    return 1e6;
  }
}

async function tvl() {
  const balances = {};

  const { host_zone: hostZones } = await get(
    "https://stride-fleet.main.stridenet.co/api/Stride-Labs/stride/stakeibc/host_zone"
  );

  const { supply: assetBalances } = await get(
    "https://stride-fleet.main.stridenet.co/api/cosmos/bank/v1beta1/supply"
  );

  hostZones.map((hostZone) => {
    const assetBalance = assetBalances.find((asset) => {
      return asset.denom === `st${hostZone.host_denom}`;
    });

    const coinDecimals = getCoinDenom(hostZone.host_denom);

    const amount = assetBalance.amount / coinDecimals;

    const geckoId = coinGeckoIds[hostZone.host_denom];

    if (!geckoId) {
      throw new Error("Missing gecko mapping: " + hostZone.host_denom);
    }

    sdk.util.sumSingleBalance(
      balances,
      geckoId,
      amount * hostZone.redemption_rate
    );
  });

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on Stride",
  stride: {
    tvl,
  },
}; // node test.js projects/stride/index.js
