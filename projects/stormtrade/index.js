const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  timetravel: false,
  methodology: 'Total amount of jUSDT locked in the StormTrade vault (EQDynReiCeK8xlKRbYArpp4jyzZuF6-tYfhFM0O5ulOs5H0L)',
  ton: {
    tvl: (
      sumTokensExport({
        owners: [
          'EQDynReiCeK8xlKRbYArpp4jyzZuF6-tYfhFM0O5ulOs5H0L', // USDT vault
          'EQDpJnZP89Jyxz3euDaXXFUhwCWtaOeRmiUJTi3jGYgF8fnj', // TON-M vault
          'EQBwfRtqEf3ZzhkeGsmXiC7hzTh1C5zZZzLgDH5VL8gENQ2A'  // Notcoin pre-market vault
        ],
        tokens: [ADDRESSES.ton.jUSDT, ADDRESSES.ton.TON]
      })
    )
  }
}
