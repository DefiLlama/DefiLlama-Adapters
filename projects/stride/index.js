const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const coinGeckoIds = {
  uatom: "cosmos",
  ustars: "stargaze",
  ujuno: "juno-network",
  uosmo: "osmosis",
};

async function tvl(timestamp, block, chainBlocks) {
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

  const { data: prices } = await utils.getPricesfromString(
    hostZones
      .map((hostZone) => {
        return coinGeckoIds[hostZone.HostDenom];
      })
      .join(",")
  );

  const coinTvls = hostZones.map((hostZone) => {
    const assetBalance = assetBalances.find((asset) => {
      return asset.denom === `st${hostZone.HostDenom}`;
    });

    const amount = assetBalance.amount / 1_000_000;

    const usdPrice = prices[coinGeckoIds[hostZone.HostDenom]].usd;

    return amount * hostZone.RedemptionRate * usdPrice;
  });

  const totalTvl = coinTvls.reduce((total, current) => {
    return total + current;
  }, 0);

  return toUSDTBalances(totalTvl);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Calculates all the coins liquid staked on Stride.",
  stride: {
    tvl,
  },
}; // node test.js projects/stride/index.js
