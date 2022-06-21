

const { ApiPromise, WsProvider } = require("@polkadot/api")
let api 

async function getKaruraAPI() {
  if (!api) {
    const provider = new WsProvider([
      // Taken from https://wiki.acala.network/integrate/integration-1/networks
      "wss://karura.api.onfinality.io/public-ws",
      "wss://pub.elara.patract.io/karura",
      "wss://karura-rpc-0.aca-api.network",
      "wss://karura-rpc-1.aca-api.network",
      "wss://karura-rpc-2.aca-api.network/ws",
      "wss://karura-rpc-3.aca-api.network/ws",
    ]);
    api = ApiPromise.create(({ provider }));
  }
  return api
}

module.exports = {
  getKaruraAPI
}
