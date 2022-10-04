const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

async function retryFetch(url, fallbackData) {
  return await retry(async bail => {
    try {
      const result = await axios.get(url)
      return result.data
    } catch (e) {
      return fallbackData
    }
  })
}

async function fetchLiquidity() {

  const yesterday = new Date(Date.now() - 864e5)

  const chartDate = `${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, "0")}_${String(new Date().getDate()).padStart(2, "0")}`
  const chartBackupDate = `${new Date().getFullYear()}_${String(yesterday.getMonth() + 1).padStart(2, "0")}_${String(yesterday.getDate()).padStart(2, "0")}`

  const CHART_FETCH_URL = `https://wt-mars-share.s3.ap-northeast-2.amazonaws.com/KLEVA_${chartDate}.json`
  const CHART_BACKUP_FETCH_URL = `https://wt-mars-share.s3.ap-northeast-2.amazonaws.com/KLEVA_${chartBackupDate}.json`

  const tvl_list_recent = await retryFetch(CHART_FETCH_URL, [{ total_tvl: 0 }])
  const tvl_list_backup = await retryFetch(CHART_BACKUP_FETCH_URL, [{ total_tvl: 0 }])

  const tvl_recent = tvl_list_recent[tvl_list_recent.length - 1]
  const tvl_backup = tvl_list_backup[tvl_list_backup.length - 1]

  return toUSDTBalances(tvl_recent.total_tvl || tvl_backup.total_tvl)
}

module.exports = {
  klaytn: {
    tvl: fetchLiquidity,
  },
  timetravel: false,
}