

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
    "wss://acala-polkadot.api.onfinality.io/public-ws",
    "wss://acala-rpc-0.aca-api.network",
    "wss://acala-rpc-1.aca-api.network",
    "wss://acala-rpc-2.aca-api.network/ws",
    "wss://acala-rpc-3.aca-api.network/ws",
    "wss://acala.polkawallet.io",
  ],
  heiko: [
    "wss://heiko-rpc.parallel.fi",
    "wss://parallel-heiko.api.onfinality.io/public-ws",
  ],
  parallel: [
    "wss://rpc.parallel.fi",
    "wss://parallel.api.onfinality.io/public-ws",
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
