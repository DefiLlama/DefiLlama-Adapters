const { queryV1Beta1V2, getBalance2 } = require('../helper/chain/cosmos')
const { transformDexBalances } = require('../helper/portedTokens')

const chain = 'bostrom'
const poolURI = 'liquidity/v1beta1/pools'
const blacklistedTokens = ['ibc/4B322204B4F59D770680FE4D7A565DDC3F37BFF035474B717476C66A4F83DD72'] // DSM giving invalid values for some reason, incorrect decimals?

async function tvl(api) {
  const pools = await queryV1Beta1V2({ chain, url: poolURI })
  const data = []

  for (const pool of pools) {
    const tokens = pool.reserve_coin_denoms
    const owner = pool.reserve_account_address
    const balances = await getBalance2({ tokens, owner, chain, blacklistedTokens })

    const keys = Object.keys(balances)
    const values = Object.values(balances)

    if (keys.length === 2 && values.length === 2) {
      const [token0, token1] = keys
      const [token0Bal, token1Bal] = values
      if (token0 && token1 && token0Bal && token1Bal) {
        data.push({ token0, token0Bal, token1, token1Bal })
      }
    }
  }

  return transformDexBalances({ chain, api, data })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Counts the liquidity on all pools. ",
  bostrom: { tvl }
}