

const { ApiPromise, WsProvider } = require("@polkadot/api")
let api 

async function getKaruraAPI() {
  if (!api) {
    const provider = new WsProvider("wss://karura-rpc-1.aca-api.network");
    api = ApiPromise.create(({ provider }));
  }
  return api
}

module.exports = {
  getKaruraAPI
}
