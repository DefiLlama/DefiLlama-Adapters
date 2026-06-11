const { get } = require('../helper/http')

const TVL_API = 'https://api-lock-service.uncx.network/tvl?chain=sol&type=all'

async function tvl(api) {
  const { result } = await get(TVL_API)
  const lockersTvlUsd = Number(result?.lockersTvlUsd || 0)
  const vestingTvlUsd = Number(result?.vestingTvlUsd || 0)

  api.addUSDValue(lockersTvlUsd + vestingTvlUsd)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is fetched from the UNCX API and reported as the sum of Solana lockers TVL and vesting TVL in USD.',
  solana: { tvl },
}
