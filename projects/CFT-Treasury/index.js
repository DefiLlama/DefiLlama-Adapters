const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')




async function getTrxBalance(account) {
  const data = await post('https://api.trongrid.io/wallet/getaccount', {
    address: TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq,
    visible: true,
  })
  return data.balance + (data.frozen?.reduce((t, { frozen_balance }) => t + frozen_balance, 0) ?? 0)
}

module.exports = {
 
  getTrxBalance,
}
