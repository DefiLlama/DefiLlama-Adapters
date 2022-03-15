const { ApiPromise, WsProvider } = require("@polkadot/api");
const { khala } = require("@phala/typedefs");
const BigNumber = require('bignumber.js');

async function tvl() {
  const provider = new WsProvider("wss://khala.api.onfinality.io/public-ws")
  const api = await ApiPromise.create({provider, types: khala})

  const stakePools = await api.query.phalaStakePool.stakePools.entries()
  const totalStake = stakePools
                      .map(([_key, stakePool]) => new BigNumber(stakePool.toJSON().totalStake.toString(10)))
                      .reduce(
                        (previousValue, currentValue) => previousValue.plus(currentValue),
                        new BigNumber(0)
                      )
  return {
    pha: totalStake / 1e12,
  };
}

module.exports = {
  methodology:
    "TVL considers PHA tokens deposited to the Mining staking",
  tvl,
};
