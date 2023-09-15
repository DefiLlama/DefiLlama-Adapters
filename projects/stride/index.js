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
  usomm: "sommelier",
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

  const hostZonePromises = hostZones.map(async (hostZone) => {
    const stDenom = "st".concat(hostZone.host_denom);
    const { amount: assetBalances } = await get(
      "https://stride-fleet.main.stridenet.co/api/cosmos/bank/v1beta1/supply/by_denom?denom=".concat(stDenom)
    );
    const assetBalance = assetBalances['amount']

    const coinDecimals = getCoinDenom(hostZone.host_denom);

    const amount = assetBalance / coinDecimals;

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

  await Promise.all(hostZonePromises);

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on Stride",
  stride: {
    tvl,
  },
}; // node test.js projects/stride/index.js
