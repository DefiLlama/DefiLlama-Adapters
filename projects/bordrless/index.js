const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/solana')

// $BORDR, the protocol's own token: reported as ownTokens, not TVL.
const BORDR = '6Mix12LiHrQFojaQEnfPUC65Qkwd6X4Y5Qg93oFbordr'

// Every SOL and SPL token on the Bordrless standard sits in its bridge vault; the list comes from the
// Bordrless API, the balances from the chain.
async function vaults() {
  return getConfig('bordrless/vaults', 'https://bordrless.app/api/stats/defillama/vaults')
}

async function sum(api, own) {
  const list = (await vaults()).filter((v) => (v.underlyingMint === BORDR) === own)
  const solOwners = list.filter((v) => v.native).map((v) => v.vault)
  const tokenAccounts = list.filter((v) => !v.native).map((v) => v.vault)
  return sumTokens2({ api, tokenAccounts, solOwners })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the SOL and SPL tokens held in the Bordrless bridge vaults, which back every bridged asset traded on the Bordrless DEX and launchpad. Coins launched on Bordrless are not counted; $BORDR is reported as own tokens.',
  solana: {
    tvl: (api) => sum(api, false),
    ownTokens: (api) => sum(api, true),
  },
}
