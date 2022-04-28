const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");
const lksmToKsm = require("./lksmToKsm.js");

async function tvl() {
  const provider = new WsProvider("wss://karura-rpc-1.aca-api.network");
  const api = await ApiPromise.create(options({ provider }));

  const ksmLocked = await lksmToKsm(
    api,
    Number(
      await api.query.tokens.totalIssuance({
        Token: "LKSM",
      })
    )
  );

  return {
    kusama: ksmLocked / 1e12,
  };
}

module.exports = {
  methodology:
    "TVL considers KSM tokens deposited to the Liquid-Staking program",
  kusuma: {
    tvl,
  },
};