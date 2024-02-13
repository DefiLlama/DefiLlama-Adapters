const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");

const chains = {
  cosmos: {
    chainId: "cosmoshub-4",
    denom: "uatom",
    coinGeckoId: "cosmos",
  },

  stargaze: {
    chainId: "stargaze-1",
    denom: "ustars",
    coinGeckoId: "stargaze",
  },

  juno: {
    chainId: "juno-1",
    denom: "ujuno",
    coinGeckoId: "juno-network",
  },

  osmosis: {
    chainId: "osmosis-1",
    denom: "uosmo",
    coinGeckoId: "osmosis",
  },

  terra2: {
    chainId: "phoenix-1",
    denom: "uluna",
    coinGeckoId: "terra-luna-2",
  },

  evmos: {
    chainId: "evmos_9001-2",
    denom: "aevmos",
    coinGeckoId: "evmos",
  },

  injective: {
    chainId: "injective-1",
    denom: "inj",
    coinGeckoId: "injective-protocol",
  },

  umee: {
    chainId: "injective-1",
    denom: "uumee",
    coinGeckoId: "umee",
  },

  comdex: {
    chainId: "comdex-1",
    denom: "ucmdx",
    coinGeckoId: "comdex",
  },

  sommelier: {
    chainId: "sommelier-3",
    denom: "usomm",
    coinGeckoId: "sommelier",
  },

  dydx: {
    chainId: "dydx-mainnet-1",
    denom: "adydx",
    coinGeckoId: "dydx-chain",
  },
  
  celestia: {
    chainId: "celestia",
    denom: "utia",
    coinGeckoId: "celestia",
  }
};

// inj uses 1e18 - https://docs.injective.network/learn/basic-concepts/inj_coin#base-denomination
function getCoinDenimals(denom) {
  return ["aevmos", "inj", "adydx"].includes(denom) ? 1e18 : 1e6;
}

function makeTvlFn(chain) {
  return async () => {
    
    // Define the URL for host_zone based on chainId
    let hostZoneUrl = `https://stride-fleet.main.stridenet.co/api/Stride-Labs/stride/stakeibc/host_zone/${chain.chainId}`;
    if (chain.chainId === 'celestia') {
      hostZoneUrl = `https://stride-fleet.main.stridenet.co/api/Stride-Labs/stride/staketia/host_zone`;
    }

    const [{ amount: assetBalances }, { host_zone: hostZone }] =
      await Promise.all([
        await get(
          `https://stride-fleet.main.stridenet.co/api/cosmos/bank/v1beta1/supply/by_denom?denom=st${chain.denom}`
        ),
        await get(
          hostZoneUrl
        ),
      ]);

    const assetBalance = assetBalances["amount"];

    const coinDecimals = getCoinDenimals(chain.denom);

    const amount = assetBalance / coinDecimals;

    const balances = {};

    sdk.util.sumSingleBalance(
      balances,
      chain.coinGeckoId,
      amount * hostZone.redemption_rate
    );

    return balances;
  };
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on Stride",
  stride: {
    tvl: async () => ({}), // kept so tvl history doesnt disappear
  },
}; // node test.js projects/stride/index.js

for (const chainName of Object.keys(chains)) {
  module.exports[chainName] = { tvl: makeTvlFn(chains[chainName]) };
}
