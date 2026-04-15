const { post } = require("../http");

const API_URL = 'https://api.hyperliquid.xyz/info';

async function hyperliquidPost(body) {
  return post(API_URL, body)
}

async function getUserStakingSummary(user) {
  const data = await hyperliquidPost({ type: 'delegatorSummary', user })
  const { delegated = "0", undelegated = "0", totalPendingWithdrawal = "0" } = data
  return { delegated: +delegated, undelegated: +undelegated, totalPendingWithdrawal: +totalPendingWithdrawal }
}

async function getHypercoreStakedHype(user) {
  const { delegated, undelegated, totalPendingWithdrawal } = await getUserStakingSummary(user)
  return BigInt(Math.round((delegated + undelegated - totalPendingWithdrawal) * 1e18))
}

module.exports = { hyperliquidPost, getUserStakingSummary, getHypercoreStakedHype }
