const { post } = require("../http");

const API_URL = 'https://api.hyperliquid.xyz/info';

async function getUserStakingSummary(user) {
  const data = await post(API_URL, { type: 'delegatorSummary', user })
  const { delegated, undelegated, totalPendingWithdrawal } = data
  if (delegated === undefined || undelegated === undefined || totalPendingWithdrawal === undefined)
    throw new Error(`Unexpected delegatorSummary response for ${user}: ${JSON.stringify(data)}`)
  return { delegated: +delegated, undelegated: +undelegated, totalPendingWithdrawal: +totalPendingWithdrawal }
}

async function getHypercoreStakedHype(user) {
  const { delegated, undelegated, totalPendingWithdrawal } = await getUserStakingSummary(user)
  return BigInt(Math.round((delegated + undelegated - totalPendingWithdrawal) * 1e18))
}

module.exports = { getUserStakingSummary, getHypercoreStakedHype }
