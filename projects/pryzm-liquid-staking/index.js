const { get } = require('../helper/http')
const { endPoints, } = require('../helper/chain/cosmos');

const host_chains = {
  cosmos: {
    hostChainId: "uatom",
    coinGeckoId: "cosmos",
    decimals: 1e6,
  },

  injective: {
    hostChainId: "inj",
    coinGeckoId: "injective-protocol",
    decimals: 1e18,
  },

  osmosis: {
    hostChainId: "uosmo",
    coinGeckoId: "osmosis",
    decimals: 1e6,
  },

  terra2: {
    hostChainId: "uluna",
    coinGeckoId: "terra-luna-2",
    decimals: 1e6,
  },

  celestia: {
    hostChainId: "utia",
    coinGeckoId: "celestia",
    decimals: 1e6,
  },
};

const endpoint = endPoints["pryzm"]

function tvlOnChain(chain) {
  return async (api) => {
    const [{ amount: coin }, { host_chain_state: state }] =
      await Promise.all([
        await get(`${endpoint}/cosmos/bank/v1beta1/supply/by_denom?denom=c:${chain.hostChainId}`),
        await get(`${endpoint}/pryzm/icstaking/v1/host_chain_state/${chain.hostChainId}`),
      ]);

    const balance = coin.amount * state.exchange_rate / chain.decimals
    api.addCGToken(chain.coinGeckoId, balance)
  };
}

for (const chainName of Object.keys(host_chains)) {
  module.exports[chainName] = { tvl: tvlOnChain(host_chains[chainName]) };
}