const { ApiPromise, WsProvider } = require("@polkadot/api")

const cgMapping = {
  '0x0200000000000000000000000000000000000000000000000000000000000000': 'sora',
  '0x0200040000000000000000000000000000000000000000000000000000000000': 'sora-validator-token',
  '0x0200050000000000000000000000000000000000000000000000000000000000': 'polkaswap',
  '0x0200060000000000000000000000000000000000000000000000000000000000': 'dai',
  '0x0200070000000000000000000000000000000000000000000000000000000000': 'ethereum',
}

const DECIMALS = 18

async function tvl(api) {
  const provider = new WsProvider("wss://ws.mof.sora.org")
  const soraApi = await ApiPromise.create({ provider })
  await soraApi.isReady

  const entries = await soraApi.query.poolXYK.reserves.entries()

  for (const [key, value] of entries) {
    const [baseAssetId, targetAssetId] = key.args
    const baseId = baseAssetId.toHex()
    const targetId = targetAssetId.toHex()

    if (cgMapping[baseId]) {
      const amount = Number(value[0].toBigInt()) * 2 / (10 ** DECIMALS)
      if (amount > 0) api.add(cgMapping[baseId], amount, { skipChain: true })
    } else    if (cgMapping[targetId]) {
      const amount = Number(value[1].toBigInt()) * 2 / (10 ** DECIMALS)
      if (amount > 0) api.add(cgMapping[targetId], amount, { skipChain: true })
    } else {
      console.log(`Unknown asset pair: ${baseId} - ${targetId}`)
    }

  }

  await soraApi.disconnect()
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: "TVL is computed from on-chain pool reserves on the SORA network (poolXYK pallet).",
  sora: { tvl },
}
