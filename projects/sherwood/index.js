const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

// Sherwood (sherwood.cash) — a privacy mixer + shielded DEX on Robinhood chain.
// Every deposited / shielded balance is custodied by a single vault contract, so
// TVL is simply the vault's holdings of every asset that has ever been registered
// in it. The asset set is discovered on-chain from the vault's TokenRegistered
// events (native ETH is assetId 1 / the zero address; everything else is an ERC20
// swapped into the pool), so new tokens are picked up automatically.
const VAULT = '0xf54013b8BE8fdFcF0CD1fD727c803F16c2450736'
const DEPLOY_BLOCK = 21248162

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: VAULT,
    fromBlock: DEPLOY_BLOCK,
    eventAbi: 'event TokenRegistered(uint256 indexed assetId, address indexed token)',
    onlyArgs: true,
  })

  const tokens = new Set(logs.map((l) => l.token.toLowerCase()))
  // Always price the two quote assets, even before their registration log is indexed.
  tokens.add(ADDRESSES.null) // native ETH
  tokens.add(ADDRESSES.robinhood.USDG.toLowerCase())

  return api.sumTokens({ owner: VAULT, tokens: [...tokens], permitFailure: true })
}

module.exports = {
  methodology:
    'TVL is the balance of every asset (native ETH, USDG and any token registered through a shielded swap) held by the Sherwood vault on Robinhood chain. The asset list is discovered from the vault\'s TokenRegistered events.',
  robinhood: { tvl },
}
