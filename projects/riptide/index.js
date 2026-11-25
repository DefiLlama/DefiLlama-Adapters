const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

// Tsunami's InkFactory. Riptide sits beside it: the factory's riptideVault()
// is the shared trading vault, and RiptideAccountFactory clones a creator's
// agent account per token. Curve reserves are counted by projects/tsunami.
const INK_FACTORY = '0x5934a5C377309453746EE8aa5194F671930c09fa'
const ACCOUNT_FACTORY = '0xAA549CB621d3cc411B0029610dbE3E2E08A3A8FF'

// Live vault, then the earlier deployment. A later riptideVault() is picked up below.
const VAULTS = [
  '0x5fef936791026dF0d4222bDd0bfA439c9D53e830',
  '0x99a8d4fEe521eD361085080C6f5dB38d57Aa6c5A',
]

const VAULT_FROM_BLOCK = 58365249 // first RiptideVault, 2026-10-13
const ACCOUNT_FROM_BLOCK = 58867078 // RiptideAccountFactory, 2026-10-18

// Quotes the vault's source is written to route on Ink. AccountCreated and
// QuoteRouteSet add any other quote that actually shows up.
const QUOTES = [
  '0x2D270e6886d130D724215A266106e6832161EAEd', // USDC
  '0x0200C29006150606B650577BBE7B6248F58470c1', // USD₮0
  '0xe343167631d89B6Ffc58B88d6b7fB0228795491D', // USDG
]

const ACCOUNT_CREATED = 'event AccountCreated(address indexed token, address indexed account, address indexed creator, address quote, uint8 endAction, uint64 expiresAt)'
const QUOTE_ROUTE_SET = 'event QuoteRouteSet(address indexed quote, address poolManager, bytes32 poolId, bool enabled)'

const addr = (a) => String(a).toLowerCase()

async function tvl(api) {
  const pointed = await api.call({ abi: 'address:riptideVault', target: INK_FACTORY })
  const vaults = [...new Set([pointed, ...VAULTS].map(addr))]

  const accountLogs = await getLogs({
    api,
    target: ACCOUNT_FACTORY,
    eventAbi: ACCOUNT_CREATED,
    onlyArgs: true,
    fromBlock: ACCOUNT_FROM_BLOCK,
  })
  const routeLogs = (await Promise.all(vaults.map((vault) => getLogs({
    api,
    target: vault,
    eventAbi: QUOTE_ROUTE_SET,
    onlyArgs: true,
    fromBlock: VAULT_FROM_BLOCK,
  })))).flat()

  const owners = [...new Set([...vaults, ...accountLogs.map((l) => addr(l.account))])]
  const tokens = new Set([nullAddress, ...QUOTES.map(addr)])
  for (const log of [...accountLogs, ...routeLogs]) {
    const quote = addr(log.quote)
    if (quote !== addr(nullAddress)) tokens.add(quote)
  }

  return sumTokens2({ api, owners, tokens: [...tokens] })
}

module.exports = {
  methodology: 'Counts native ETH and ERC20 quote balances of the Riptide vault (InkFactory.riptideVault(), plus the earlier vault deployment) and of every RiptideAgentAccount created by the account factory. Launch-token inventory minted to the vault is excluded. Bonding-curve reserves are Tsunami TVL and are not counted here.',
  start: '2026-10-13',
  ink: { tvl },
}
