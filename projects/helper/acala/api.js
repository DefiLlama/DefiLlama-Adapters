

const { ApiPromise, WsProvider } = require("@polkadot/api")
const { Wallet } = require("@acala-network/sdk/wallet")
const { options } = require("@acala-network/api")

const api = {}

const providers = {
  karura: [
    // Taken from https://wiki.acala.network/integrate/integration-1/networks
    "wss://karura.api.onfinality.io/public-ws",
    "wss://pub.elara.patract.io/karura",
    "wss://karura-rpc-0.aca-api.network",
    "wss://karura-rpc-1.aca-api.network",
    "wss://karura-rpc-2.aca-api.network/ws",
    "wss://karura-rpc-3.aca-api.network/ws",
  ],
  polkadot: [
    "wss://polkadot-rpc.dwellir.com",
    "wss://polkadot.api.onfinality.io/public-ws",
    "wss://rpc.polkadot.io",
  ],
  kusama: [
    "wss://kusama-rpc.polkadot.io",
    "wss://kusama.api.onfinality.io/public-ws",
    "wss://kusama-rpc.dwellir.com",
  ],
  acala: [
    "wss://acala.polkawallet.io",
  ],
}

async function getAPI(chain) {
  if (!api[chain]) {
    const provider = new WsProvider(providers[chain]);
    api[chain] = ApiPromise.create(options({ provider }))
  }

  await api[chain].isReady
  return api[chain]
}

async function getWallet(chain) {
  const api = await getAPI(chain)
  const wallet = new Wallet(api, {
    supportAUSD: true,
  })

  await wallet.isReady
  return wallet
}

module.exports = {
  getAPI,
  getWallet,
}
