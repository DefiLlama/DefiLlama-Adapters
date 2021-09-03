
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

const KSM_DECIMALS = 12;


async function tvl() {
  const provider = new WsProvider("wss://karura.api.onfinality.io/public-ws");
  const api = await ApiPromise.create(options({ provider }));

  const ksmLocked = (await api.query.homaLite.totalStakingCurrency()).toJSON() / 10 ** KSM_DECIMALS;

  return {
    'kusama': ksmLocked
  }
}

module.exports = {
  methodology: 'TVL considers KSM tokens deposited to the Liquid-Staking program',
  tvl
}
