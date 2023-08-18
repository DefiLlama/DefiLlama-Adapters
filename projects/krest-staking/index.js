const { ApiPromise, WsProvider } = require("@polkadot/api");
const BN = require("bignumber.js");

async function tvl() {
  const provider = new WsProvider("wss://wss-krest.peaq.network");
  const api = new ApiPromise({ provider });
  await api.isReady;

  const totalCollatorStaking = await api.query.parachainStaking.totalCollatorStake();
  let tvl = totalCollatorStaking['collators'].add(totalCollatorStaking['delegators']);

  return {
      'krest': Number(tvl / Number(10 ** 18))
  }
}

module.exports = {
  timetravel: false,
  krest: {
    tvl: tvl
  },
};
