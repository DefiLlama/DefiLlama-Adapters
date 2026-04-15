const { post } = require("../http");

const API_URL = 'https://api.hyperliquid.xyz/info';

async function getUserStakingSummary(user) {
  const data = await post(API_URL, { type: 'delegatorSummary', user })
  const { delegated = "0", undelegated = "0", totalPendingWithdrawal = "0" } = data
  return { delegated: +delegated, undelegated: +undelegated, totalPendingWithdrawal: +totalPendingWithdrawal }
}

async function getHypercoreStakedHype(user) {
  const { delegated, undelegated, totalPendingWithdrawal } = await getUserStakingSummary(user)
  return BigInt(Math.round((delegated + undelegated - totalPendingWithdrawal) * 1e18))
}

module.exports = { getUserStakingSummary, getHypercoreStakedHype }
