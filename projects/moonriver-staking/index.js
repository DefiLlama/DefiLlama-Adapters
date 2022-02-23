const { ApiPromise, WsProvider } = require("@polkadot/api");

const DECIMALS = 18;

async function tvl(ws) {
  const provider = new WsProvider("wss://wss.api.moonriver.moonbeam.network");
  const api = new ApiPromise({
    provider,
  });

  await api.isReady;
  const round = (await api.query.parachainStaking.round()).toJSON();
  const lastRound = (await api.query.parachainStaking.staked(round.current - 1)).toBigInt();

  return {
    moonriver: lastRound / BigInt(10 ** DECIMALS)
  }
}

module.exports = {
  methodology:
    "Staking value in Moonriver is taken into account to calculate TVL",
  tvl
};
