const { getAPI } = require('../helper/acala/api')
const { forceToCurrencyId } = require("@acala-network/sdk-core");

module.exports = {
  karura: {
    tvl: async () => {
      const chain = 'karura'
      const api = await getAPI(chain)
      const account = 'qmmNug1GQstpimAXBphJPSbDawH47vwMmhuSUq9xRqAsDAr'
      const account_3USD = 'qmmNug1GQstpimAXBpy3QzBL5cUWg2p6SeQzRWzRFhu8pfX'

      const stableAssetRes = (await api.query.stableAsset.pools(1)).toJSON()
      let usdcIndex = -1
      stableAssetRes.assets.forEach((val, i) => {
        if (val.erc20)  usdcIndex = i
      })
      const usdcBalance = (stableAssetRes.balances[usdcIndex])/1e12
      return {
        kusama: (await balanceOf(api, account, 'KSM')) / 1e12,
        'liquid-ksm': (await balanceOf(api, account, 'LKSM')) / 1e12,
        'acala-dollar': (await balanceOf(api, account_3USD, 'KUSD')) / 1e12,
        // 'usd-coin': (await balanceOf(api, account_3USD, 'erc20://0x1f3a10587a20114ea25ba1b388ee2dd4a337ce27')) / 1e6,
        'usd-coin': usdcBalance,
        tether: (await balanceOf(api, account_3USD, 'fa://7')) / 1e6,
      }
    }
  },
};

async function balanceOf(api, account, token) {
  const currencyId = await forceToCurrencyId(api, token)
  const tokenRes = await api.query.tokens.accounts(account, currencyId)
  // console.log(token, Math.floor(+tokenRes.toHuman().free.replaceAll(',', '')))
  return +tokenRes.toHuman().free.replaceAll(',', '')
}
