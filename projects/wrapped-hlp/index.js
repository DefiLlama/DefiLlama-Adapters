const { getConfig } = require("../helper/cache")

const WHLP_VAULT = '0x1359b05241cA5076c9F59605214f4F84114c0dE8'
const CHAIN_ID_STR = '999'

const tvl = async (api) => {
  const data = await getConfig(
    'whlp-tokens',
    `https://backend.nucleusearn.io/v1/vaults/underlying_strategies?vault_address=${WHLP_VAULT}&chain_id=${CHAIN_ID_STR}`
  )
  const strat = data?.[CHAIN_ID_STR]
  if (!strat) return

  let totalUsd = 0
  for (const pos of Object.values(strat)) totalUsd += Number(pos.valueInBase || 0)

  const priceData = await fetch(`https://coins.llama.fi/prices/current/hyperliquid:${WHLP_VAULT}`).then(r => r.json())
  const whlpPrice = priceData?.coins?.[`hyperliquid:${WHLP_VAULT}`]?.price
  if (!whlpPrice || whlpPrice <= 0) return

  const whlpAmount = BigInt(Math.round((totalUsd / whlpPrice) * 1e6))
  api.add(WHLP_VAULT, whlpAmount)
}

module.exports = {
  hyperliquid: { tvl },
  misrepresentedTokens: true,
  methodology:
    "The total USD value of assets in strategy positions held by the wHLP vault.",
}
