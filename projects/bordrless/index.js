const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/solana')

// $BORDR, the protocol's own token: its wrapped supply sits in the treasury wallet, so it is not counted.
const BORDR = '6Mix12LiHrQFojaQEnfPUC65Qkwd6X4Y5Qg93oFbordr'

// Every SOL and SPL token on the Bordrless standard sits in its bridge vault; the list comes from the
// Bordrless API, the balances from the chain.
async function vaults() {
  return getConfig('bordrless/vaults', undefined, {
    fetcher: async () => {
      const list = await get('https://bordrless.app/api/stats/defillama/vaults')
      if (!Array.isArray(list) || !list.some((v) => v.native)) throw new Error('bordrless: bad vault list')
      return list
    },
  })
}

async function tvl(api) {
  const list = (await vaults()).filter((v) => v.underlyingMint !== BORDR)
  const solOwners = list.filter((v) => v.native).map((v) => v.vault)
  const tokenAccounts = list.filter((v) => !v.native).map((v) => v.vault)
  return sumTokens2({ api, tokenAccounts, solOwners })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the SOL and SPL tokens held in the Bordrless bridge vaults, which back every bridged asset traded on the Bordrless DEX and launchpad. Coins launched on Bordrless and $BORDR are not counted.',
  solana: { tvl },
}
