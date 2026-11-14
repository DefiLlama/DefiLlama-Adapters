const { PublicKey } = require('@solana/web3.js')
const { getLogs2 } = require('../helper/cache/getLogs')
const { getConnection, sumTokens2 } = require('../helper/solana')

const launched = 'event Launched(address indexed market, address indexed token, address indexed creator, address quote, bool nativeAlpha)'

// LaunchFactory per chain, fromBlock is the factory deployment block
const config = {
  robinhood: { factory: '0xD45D538AA6Ab9261A638b9Df83312f823BB368fC', fromBlock: 103445727 },
  base: { factory: '0x7cdd6aCD10144C89B630Bce8b2031d80df57628c', fromBlock: 53375932 },
  bsc: { factory: '0x71abe80C8f08ebE5dac018601170e687ED737AC3', fromBlock: 131062839 },
  ethereum: { factory: '0x2DC4f507BD30c6b5df90B288FaeCDeCE627386Ec', fromBlock: 26320476 },
  arc: { factory: '0x11A5ac5fC2A1e7D4bF61B781b0b784462C2BD9e7', fromBlock: 28998006 },
  monad: { factory: '0xB2Aa70bF167AEc63DBC49f14F12d4301E5a3c2A8', fromBlock: 121283239 },
  avax: { factory: '0xB2Aa70bF167AEc63DBC49f14F12d4301E5a3c2A8', fromBlock: 100053182 },
  arbitrum: { factory: '0xB2Aa70bF167AEc63DBC49f14F12d4301E5a3c2A8', fromBlock: 523406566 },
  polygon: { factory: '0xB2Aa70bF167AEc63DBC49f14F12d4301E5a3c2A8', fromBlock: 97230966 },
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, target: factory, eventAbi: launched, fromBlock })
  return api.sumTokens({ tokensAndOwners: logs.map(l => [l.quote, l.market]) })
}

// ALPHA launch program on Solana
const SOLANA_PROGRAM = new PublicKey('r4yX8Q9Z5zSLY2fjoq1DgijfoHLru49zfikq79pa1fa')
// Base58 of the Anchor `Market` account discriminator
const MARKET_DISCRIMINATOR = 'dkokXHR3DTw'
// Market account: 8 discriminator, 5 header, then ten pubkeys, of which the quote vault is the seventh
const QUOTE_VAULT_OFFSET = 13 + 32 * 6

// Graduation moves the vault's balance to Meteora DAMM v2, so the balance needs no stage check
async function solanaTvl(api) {
  const markets = await getConnection().getProgramAccounts(SOLANA_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: MARKET_DISCRIMINATOR } }],
    dataSlice: { offset: QUOTE_VAULT_OFFSET, length: 32 },
  })
  return sumTokens2({ api, tokenAccounts: markets.map(m => new PublicKey(m.account.data).toBase58()) })
}

module.exports = {
  // Solana is read from current account state, which has no history
  timetravel: false,
  methodology: 'TVL is the pairing asset held by each ALPHA bonding-curve market. Markets are read from the factory Launched events on EVM chains and from the program Market accounts on Solana, and counted at the pairing asset balance they hold, which includes fees waiting to be settled. Graduated liquidity sits in Uniswap v4 or Meteora DAMM v2 and is not counted here.',
  solana: { tvl: solanaTvl },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
