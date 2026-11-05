const { PublicKey } = require('@solana/web3.js')
const { getLogs2 } = require('../helper/cache/getLogs')
const { getConnection } = require('../helper/solana')

const launched = 'event Launched(address indexed market, address indexed token, address indexed creator, address quote, bool nativeAlpha)'

// LaunchFactory per chain, fromBlock is the factory deployment block
const config = {
  robinhood: { factory: '0xD45D538AA6Ab9261A638b9Df83312f823BB368fC', fromBlock: 103445727 },
  base: { factory: '0x7cdd6aCD10144C89B630Bce8b2031d80df57628c', fromBlock: 53375932 },
  bsc: { factory: '0x71abe80C8f08ebE5dac018601170e687ED737AC3', fromBlock: 131062839 },
  ethereum: { factory: '0x2DC4f507BD30c6b5df90B288FaeCDeCE627386Ec', fromBlock: 26320476 },
  arc: { factory: '0x11A5ac5fC2A1e7D4bF61B781b0b784462C2BD9e7', fromBlock: 28998006 },
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, target: factory, eventAbi: launched, fromBlock })
  // A market's quote balance also holds unsettled fees, so read the curve principal instead
  const principals = await api.multiCall({ abi: 'uint256:principal', calls: logs.map(l => l.market) })
  api.add(logs.map(l => l.quote), principals)
}

// ALPHA launch program on Solana
const SOLANA_PROGRAM = new PublicKey('r4yX8Q9Z5zSLY2fjoq1DgijfoHLru49zfikq79pa1fa')
// Base58 of the Anchor `Market` account discriminator
const MARKET_DISCRIMINATOR = 'dkokXHR3DTw'
// Market account: 8 discriminator, 5 header, then ten pubkeys, of which quote_mint is the fifth
const QUOTE_MINT_OFFSET = 141
// name, symbol and metadata_uri follow the pubkeys. They are Borsh strings, so later fields move with their length
const STRINGS_OFFSET = 333
const STRING_COUNT = 3
const PRINCIPAL_INDEX = 12 // principal is the 13th u64 after the strings
// principal, 2 pending fees, preset, 2 fee bps, policy hash, retired config, 5 u64, then stage
const PRINCIPAL_TO_STAGE = 8 + 16 + 1 + 4 + 32 + 32 + 40
const STAGE_ACTIVE = 2 // Curve = 0, Ready = 1, Active = 2 (graduated)

async function solanaTvl(api) {
  const markets = await getConnection().getProgramAccounts(SOLANA_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: MARKET_DISCRIMINATOR } }],
  })

  markets.forEach(({ account: { data } }) => {
    let offset = STRINGS_OFFSET
    for (let i = 0; i < STRING_COUNT; i++) offset += 4 + data.readUInt32LE(offset)
    const principalOffset = offset + PRINCIPAL_INDEX * 8
    // Unlike the EVM markets, principal keeps its value after graduation, when the money has moved to Meteora
    if (data[principalOffset + PRINCIPAL_TO_STAGE] === STAGE_ACTIVE) return
    const quoteMint = new PublicKey(data.subarray(QUOTE_MINT_OFFSET, QUOTE_MINT_OFFSET + 32)).toBase58()
    api.add(quoteMint, data.readBigUInt64LE(principalOffset).toString())
  })
}

module.exports = {
  // Solana is read from current account state, which has no history
  timetravel: false,
  methodology: 'TVL is the pairing asset held as curve principal by each ALPHA bonding-curve market. EVM markets are read from the factory Launched events and Solana markets from the program Market accounts. Fees waiting to be settled are excluded. Graduated liquidity sits in Uniswap v4 or Meteora DAMM v2 and is not counted here.',
  solana: { tvl: solanaTvl },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
