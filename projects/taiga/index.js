const sdk = require('@defillama/sdk')
const { getTokensAccount } = require('../helper/chain/substrate')
const { token, foreignAsset } = require('../helper/acala/currency')

const chain = 'karura'
const account = 'qmmNug1GQstpimAXBphJPSbDawH47vwMmhuSUq9xRqAsDAr'
const account_3USD = 'qmmNug1GQstpimAXBpy3QzBL5cUWg2p6SeQzRWzRFhu8pfX'

const balanceOf = async (owner, currencyId) => Number((await getTokensAccount(chain, owner, currencyId)).free)

async function tvl() {
  const { output: usdcRes } = await sdk.api.erc20.balanceOf({
    target: '0x1F3a10587A20114EA25Ba1b388EE2dD4A337ce27',
    owner: '0xC760Da3C525c8511938c35613684c3f6175c01A5',
    chain: 'karura_evm',
  })

  return {
    kusama: (await balanceOf(account, token('KSM'))) / 1e12,
    'liquid-ksm': (await balanceOf(account, token('LKSM'))) / 1e12,
    'usd-coin': usdcRes / 1e6,
    tether: (await balanceOf(account_3USD, foreignAsset(7))) / 1e6,
  }
}

module.exports = {
  timetravel: false,
  karura: { tvl },
}
