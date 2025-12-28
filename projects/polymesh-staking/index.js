const { ApiPromise, WsProvider } = require("@polkadot/api")

const WS_ENDPOINT = "wss://mainnet-rpc.polymesh.network"
const POLYX_DECIMALS = 1e6

async function tvl(api) {
  const provider = new WsProvider(WS_ENDPOINT)
  const chainApi = await ApiPromise.create({ provider })
  await chainApi.isReady

  // TVL = total amount bonded in staking (POLYX)
  // Source: staking pallet → erasTotalStake for the active era
  const activeEra = await chainApi.query.staking.activeEra()
  const eraIndex =
    activeEra.toJSON()?.index ?? activeEra.toHuman()?.index

  const total = await chainApi.query.staking.erasTotalStake(eraIndex)
  const totalPolyx = Number(total.toString()) / POLYX_DECIMALS

  await chainApi.disconnect()

  api.addCGToken("polymesh", totalPolyx)
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts total staked POLYX on Polymesh using the staking pallet erasTotalStake for the active era.",
  polymesh: { tvl },
}
