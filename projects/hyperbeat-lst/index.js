const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios')

const API_URL = 'https://api.hyperliquid.xyz/info'
const delegator = '0xCeaD893b162D38e714D82d06a7fe0b0dc3c38E0b'
const withdrawManager = '0x9d0B0877b9f2204CF414Ca7862E4f03506822538'
const WHYPE = ADDRESSES.hyperliquid.WHYPE

const tvl = async (api) => {
  const withdrawable = await api.call({ target: withdrawManager, abi: 'uint256:getLiquidHypeAmount' })
  const { data: delegatedData } = await axios.post(API_URL, { type: "delegatorSummary", user: delegator })
  const { delegated, totalPendingWithdrawal } = delegatedData
  const delegatedBalance = ((+delegated + +totalPendingWithdrawal) * 1e18)
  api.add(WHYPE, +withdrawable + delegatedBalance)
}

module.exports = {
  hyperliquid: { tvl }
}