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
const amm_vault_address = "pryzm1y7d08j5uy7kgurnv4pwag8h34m2cgptcwe75wn";

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

async function tvl(api) {
  const { balances: data } =
    await get(`${endpoint}/cosmos/bank/v1beta1/balances/${amm_vault_address}?pagination.limit=1000`);

  for (const { denom, amount } of data) {
    if (denom.startsWith("c:") ||
      denom.startsWith("p:") ||
      denom.startsWith("y:") ||
      denom.startsWith("lp:")
    ) {
      continue
    }
    if (denom === 'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395')
      api.addCGToken('terra-luna-2', amount/1e6)
    else
      api.add(denom, amount);
  }
}

module.exports = {
  methodology: "Counts the liquidity on liquid staking module and all AMM pools",
  pryzm: {
    tvl
  },
};

for (const chainName of Object.keys(host_chains)) {
  module.exports[chainName] = { tvl: tvlOnChain(host_chains[chainName]) };
}