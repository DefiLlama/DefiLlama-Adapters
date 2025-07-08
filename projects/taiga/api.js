const { getAPI } = require('../helper/acala/api')
const sdk = require('@defillama/sdk')

module.exports = {
  karura: {
    tvl: async () => {
      const chain = 'karura'
      const api = await getAPI(chain)
      const account = 'qmmNug1GQstpimAXBphJPSbDawH47vwMmhuSUq9xRqAsDAr'
      const account_3USD = 'qmmNug1GQstpimAXBpy3QzBL5cUWg2p6SeQzRWzRFhu8pfX'

      const { output: usdcRes } = await sdk.api.erc20.balanceOf({
        target: '0x1F3a10587A20114EA25Ba1b388EE2dD4A337ce27',
        owner: '0xC760Da3C525c8511938c35613684c3f6175c01A5',
        chain: 'karura_evm',
      })
      const usdcBalance = usdcRes / 1e6

      return {
        kusama: (await balanceOf(api, account, { Token: 'KSM' })) / 1e12,
        'liquid-ksm': (await balanceOf(api, account, { Token: 'LKSM'})) / 1e12,
        // 'acala-dollar': (await balanceOf(api, account_3USD, 'KUSD')) / 1e12,
        // 'usd-coin': (await balanceOf(api, account_3USD, 'erc20://0x1f3a10587a20114ea25ba1b388ee2dd4a337ce27')) / 1e6,
        'usd-coin': usdcBalance,
        tether: (await balanceOf(api, account_3USD, { ForeignAsset: '7'})) / 1e6,
      }
    }
  },
};

async function balanceOf(api, account, token) {
  const tokenRes = await api.query.tokens.accounts(account, token)
  return +tokenRes.toHuman().free.replace(/,/g, '')
}
