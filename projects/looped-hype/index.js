const { getConfig } = require("../helper/cache")

const LHYPE_VAULT = '0x5748ae796AE46A4F1348a1693de4b50560485562'
const CHAIN_ID_STR = '999'
const HYPE_TOKEN = '0x5555555555555555555555555555555555555555'

const tvl = async (api) => {
  const data = await getConfig(
    'lhype-tokens',
    `https://backend.nucleusearn.io/v1/vaults/underlying_strategies?vault_address=${LHYPE_VAULT}&chain_id=${CHAIN_ID_STR}`
  )

  const strat = data?.[CHAIN_ID_STR]
  if (!strat) return

  let totalHype = 0
  for (const pos of Object.values(strat)) {
    totalHype += Number(pos.valueInBase || 0)
  }

  const hypeAmount = BigInt(Math.round(totalHype * 1e18))
  api.add(HYPE_TOKEN, hypeAmount)
}

module.exports = {
  hyperliquid: { tvl },
  methodology: 'The total value of assets deployed across all LHYPE strategies.',
  misrepresentedTokens: true,
}
