const { post } = require('../http')
const BigNumber = require('bignumber.js')

// Subscan API endpoint
const BASE_URL = 'https://avail.api.subscan.io/api'
const DECIMALS = 18

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': 'f89d810db5ef4c4fbc83b987dc2ffcda'
}

// Convert raw amount to human readable format
function formatFromDecimals(amount) {
  if (!amount) return 0
  return Number(new BigNumber(amount).div(10 ** DECIMALS))
}

// Get staked amount for AVAIL tokens
async function getTokenData() {
  const data = await post(`${BASE_URL}/scan/token`, {}, { headers })
  const tokenData = data?.data?.detail?.AVAIL
  if (!tokenData) return { stakedAmount: 0 }

  // Get staked amounts from validators and nominators
  const stakedAmount = formatFromDecimals(
    new BigNumber(tokenData.validator_bonded ?? 0)
      .plus(tokenData.nominator_bonded ?? 0)
      .toString()
  )

  return { stakedAmount }
}

module.exports = {
  getTokenData,
  DECIMALS
} 