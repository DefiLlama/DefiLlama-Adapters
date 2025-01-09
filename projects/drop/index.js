const sdk = require("@defillama/sdk");
const { queryContract } = require('../helper/chain/cosmos')

const chains = {
  cosmos: {
    chainId: "cosmoshub-4",
    denom: "uatom",
    coinGeckoId: "cosmos",
    dropContract: "neutron16m3hjh7l04kap086jgwthduma0r5l0wh8kc6kaqk92ge9n5aqvys9q6lxr"
  },
  celestia: {
    chainId: "celestia",
    denom: "utia",
    coinGeckoId: "celestia",
    dropContract: "neutron1fp649j8djj676kfvh0qj8nt90ne86a8f033w9q7p9vkcqk9mmeeqxc9955"
  },
};

function makeTvlFn(chain) {
  return async () => {
    const balances = {};
    const data = await queryContract({
      contract: chain.dropContract,
      chain: "neutron",
      data: {
        "total_bonded": {}
      }
    });
    const assetBalance = parseInt(data, 10) / 1e6;
    const amount = assetBalance;

    sdk.util.sumSingleBalance(
      balances,
      chain.coinGeckoId,
      amount
    );

    return balances;
  };
}

module.exports = {
  timetravel: false,
  methodology: "Sum of all the tokens that are liquid staked on DROP",
};

for (const chainName of Object.keys(chains)) {
  module.exports[chainName] = { tvl: makeTvlFn(chains[chainName]) };
}
