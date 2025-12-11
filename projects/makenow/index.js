const { get } = require('../helper/http')

const ADDRESSES = require('../helper/coreAssets.json')
const serviceURL = 'https://api.makenow.meme/tvl/all'
const SOL_DECIMALS = 9

async function tvl(api) {
  const toTs = api.timestamp
  const url = `${serviceURL}?toTs=${toTs}`
  const response = await get(url)

  const solAmount = response.data.length > 0 ? Math.round(response.data[0].tvl * 10 ** SOL_DECIMALS) : 0
  api.add(ADDRESSES.solana.SOL, solAmount > 0 ? solAmount : 0)
}

module.exports = {
  start: 1735689600, // 2025-01-01 00:00:00 UTC
  methodology: "TVL is counted as the amount of SOL locked in the liquidity pools on Raydium Launchpad",
  solana: {
    tvl,
  },
}