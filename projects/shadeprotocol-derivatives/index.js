const { queryV1Beta1 } = require("../helper/chain/cosmos")
const { queryContract } = require("../helper/chain/secret")

const STKD_SCRT_CONTRACT = 'secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4'
const DENOM = 'uscrt'

function toBaseAmount(amount = 0) {
  const [wholeAmount] = String(amount).split('.')
  return BigInt(wholeAmount || 0)
}

function sumAmounts(amounts) {
  return amounts.reduce((sum, amount) => sum + toBaseAmount(amount), 0n)
}

async function queryPaginated(url, listKey) {
  let values = []
  let key

  do {
    const query = `${url}?pagination.limit=1000${key ? `&pagination.key=${encodeURIComponent(key)}` : ''}`
    const page = await queryV1Beta1({ chain: 'secret', url: query })
    const pageValues = page[listKey]
    if (!Array.isArray(pageValues)) throw new Error(`Missing ${listKey} response`)
    values = values.concat(pageValues)
    key = page.pagination?.next_key
  } while (key)

  return values
}

async function tvl(api) {
  const [{ staking_info: stakingInfo }, unbonding] = await Promise.all([
    queryContract({ contract: STKD_SCRT_CONTRACT, data: { staking_info: { time: Math.floor(Date.now() / 1000) } } }),
    queryPaginated(`staking/v1beta1/delegators/${STKD_SCRT_CONTRACT}/unbonding_delegations`, 'unbonding_responses'),
  ])

  if (!stakingInfo) throw new Error('Missing staking_info response')

  let total = sumAmounts([
    stakingInfo.bonded_scrt,
    stakingInfo.reserved_scrt,
    stakingInfo.available_scrt,
    stakingInfo.rewards,
  ])
  total += unbonding.reduce((sum, item) => (
    sum + (item.entries || []).reduce((entrySum, entry) => entrySum + toBaseAmount(entry.balance), 0n)
  ), 0n)

  api.add(DENOM, total.toString())
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts SCRT backing stkd-SCRT using the staking contract accounting plus active unbonding SCRT.',
  secret: {
    tvl
  }
}
