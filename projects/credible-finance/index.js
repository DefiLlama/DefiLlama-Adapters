const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, sumTokens2 } = require('../helper/solana')
const { sumTokensExport } = require('../helper/sumTokens')
const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default || require('bs58')

// Credible Finance lending program on Solana
const PROGRAM_ID = new PublicKey('ChYswtf6MRpPDpcVftANnj1g3ryVH9fpJ1XvjWRzxaGP')

// Anchor `Pool` account. Layout (after 8-byte discriminator):
//   owner, borrower, lending_currency, lp_currency, collateral_currency : pubkey (32 each)
//   pool_id : [u8; 8]
//   tvl : u64        -> total principal deposited into the lending pool
//   drawdown : u64   -> amount drawn down by borrowers (i.e. borrowed)
const POOL_DISCRIMINATOR = Buffer.from([241, 154, 109, 4, 17, 177, 109, 188])
const OFFSET_LENDING_CURRENCY = 8 + 32 * 2
const OFFSET_TVL = 8 + 32 * 5 + 8 // after the 5 pubkeys and pool_id
const OFFSET_DRAWDOWN = OFFSET_TVL + 8

async function getPools() {
  const conn = getProvider().connection
  const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(POOL_DISCRIMINATOR) } }],
  })
  return accounts.map(({ account }) => {
    const data = account.data
    const mint = new PublicKey(data.slice(OFFSET_LENDING_CURRENCY, OFFSET_LENDING_CURRENCY + 32)).toBase58()
    const tvl = data.readBigUInt64LE(OFFSET_TVL)
    const drawdown = data.readBigUInt64LE(OFFSET_DRAWDOWN)
    return { mint, tvl, drawdown }
  })
}

async function solanaTvl(api) {
  // Treasury / fee token balances held by the protocol owner
  await sumTokens2({
    api,
    owner: '4uhwwcipVRFczcCPCgZDkMgWaL8kGw7ht4k6HT3faw3g',
    tokens: [
      'FxPk1scQjw34NSwm4JKz7sT2Bw781TqwFU9efZdrrLQU',
      ADDRESSES.solana.USDC,
      '91u7wA938FMTHzAGtg6LcoysasfBkFQQmMCauLRSgHDL',
      '5HxCAwuu4SX73gjVG7dP7hZKrSGhRydy6VJWgG1yhtBj',
      'SNSG2yDc1QHxurjb5ZKUbc5pKLKAv18LLe3yFumxXod',
      'GBcoT7TugeegPSCujzariSMMHc4cF8AxcfFTctAHZp5R',
      'G7F8pVSQTkHsfh4ZZxttb5ZxNH9WpQiNAUn1aJn1SkoB',
      'JDpHtDaf69SyKwDkkTGP5okRBRw1jfocMr4E7DgzXXBt',
      'CYyQ1mwFthpFozHpc7xxguyrZ5vegFBKrg3uhsY3vXDf',
    ],
  })
  // // Lending pools: liquidity still available in the pool (deposits not yet borrowed)
  // const pools = await getPools()
  // for (const { mint, tvl, drawdown } of pools) {
  //   const available = tvl > drawdown ? tvl - drawdown : 0n
  //   if (available > 0n) api.add(mint, available.toString())
  // }
}

async function solanaBorrowed(api) {
  const pools = await getPools()
  for (const { mint, drawdown } of pools) {
    if (drawdown > 0n) api.add(mint, drawdown.toString())
  }
}

module.exports = {
  methodology:
    "Lending TVL counts deposits still available in Credible Finance's lending pools (pool.tvl minus drawn-down amount) plus token balances held by the protocol treasury. Borrowed counts the amount drawn down from the pools by borrowers. Tokens on 0g are counted from the protocol contract.",
  timetravel: false,
  solana: {
    tvl: solanaTvl,
    borrowed: solanaBorrowed,
  },
  '0g': {
    tvl: sumTokensExport({
      owner: '0x907F40d1D6649810E0C6C2Af5e0d42c7C10ad295',
      tokens: [
        '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e',
        '0x9cc1d782e6dfe5936204c3295cb430e641dcf300',
        ADDRESSES.sseed.oUSDT,
        '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c',
      ],
    }),
  },
}
