const { getConfig } = require("../helper/cache")

const WHLP_VAULT = '0x1359b05241cA5076c9F59605214f4F84114c0dE8'
const CHAIN_ID_STR = '999'
const USDT_TOKEN = '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb'

const tvl = async (api) => {
  const data = await getConfig(
    'whlp-tokens',
    `https://backend.nucleusearn.io/v1/vaults/underlying_strategies?vault_address=${WHLP_VAULT}&chain_id=${CHAIN_ID_STR}`
  )

  const strat = data?.[CHAIN_ID_STR]
  if (!strat) return

  let totalUsd = 0
  for (const pos of Object.values(strat)) {
    totalUsd += Number(pos.valueInBase || 0)
  }

  api.add(USDT_TOKEN, totalUsd * 1e6)
}

module.exports = {
  methodology: "The total USD value of assets in strategy positions held by the WHLP vault.",
  misrepresentedTokens: true,
  hyperliquid: { tvl },
}
