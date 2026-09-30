const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default || require('bs58')
const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')

const EXPONENT_VAULTS_PROGRAM = new PublicKey('sVau1tXvayVWfotzm9Ahcv2qfnnfRWttt78BCnNC6dD')
const STRATEGY_VAULT_DISCRIMINATOR = Buffer.from([98, 228, 39, 201, 116, 210, 39, 11])
// Loopscale Asset Curation's key in the vault's roles.curator
const LOOPSCALE_CURATOR = 'bs1PuRvB9rBBZkryBjADYvxc2qYh51EVW2fsb1uTiBN'
const LOOPSCALE_CURATOR_BYTES = new PublicKey(LOOPSCALE_CURATOR).toBuffer()

// Exponent's synthetic quote mints (same mapping as exponent-v2)
const SYNTHETIC_MINT_MAP = {
  'USD1111111111111111111111111111111111111111': ADDRESSES.solana.USDC,
  'USD1111111111111111111111111111111111111119': 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT', // USDe
}

// Layout from the exponent SDK's ExponentStrategyVault codec; enum tags are u8, vec lengths u32
function decodeVault(data) {
  if (!data.subarray(0, 8).equals(STRATEGY_VAULT_DISCRIMINATOR))
    throw new Error('unexpected ExponentStrategyVault discriminator')

  let offset = 8
  const skip = (n) => { offset += n }
  const u8 = () => data.readUInt8(offset++)
  const u32 = () => { const v = data.readUInt32LE(offset); offset += 4; return v }
  const u64 = () => { const v = data.readBigUInt64LE(offset); offset += 8; return v }
  const pubkey = () => { const v = new PublicKey(data.subarray(offset, offset + 32)).toString(); offset += 32; return v }
  const vec = (readItem) => Array.from({ length: u32() }, () => readItem())
  const priceId = () => {
    const kind = u8()
    if (kind === 0) skip(8) // Simple(u64)
    else if (kind === 1) skip(u32() * 8) // Multiply(vec<u64>)
    else throw new Error(`unknown Exponent PriceId variant ${kind}`)
  }
  const strategyPosition = () => {
    const kind = u8()
    switch (kind) {
      case 0: skip(32 + 4 + 32); skip(u32() * 4); priceId(); priceId(); skip(32); break // Orderbook
      case 1: skip(32); vec(() => { skip(32); priceId(); skip(8) }); break // TokenAccount
      case 2: // Obligation
        if (u8() !== 0) throw new Error('unknown Exponent ObligationType variant')
        skip(32 + 32); priceId(); vec(() => { skip(32); priceId() }); skip(u32() * 65); skip(1); break
      case 3: case 4: skip(32 + 32); priceId(); priceId(); break // YieldPosition, ClmmPosition
      case 5: case 6: case 8: skip(32); break // LoopscaleLoan, LoopscaleStrategy, OrcaWhirlpoolPosition
      case 7: skip(32 + 32); break // KaminoFarm
      case 9: skip(32 + 8); break // LoopscaleVaultStake
      default: throw new Error(`unknown Exponent StrategyPosition variant ${kind}`)
    }
  }

  skip(32 + 32 + 32) // navAumCircuitBreakerState, squadsSettings, squadsVault
  vec(() => { skip(32); priceId(); skip(32 + 32 + 8); skip(u32() * 8) }) // tokenEntries
  const underlyingMint = pubkey()
  skip(32 + 32 + 2 + 32 + 32 + 1) // mintLp, tokenLpEscrow, normalWithdrawalCutBp, feeTreasury, selfAddress, signerBump
  const statusFlags = u8()
  skip(8) // financials.lpBalance
  const aum = u64() + u64() // aumInBase + aumInBaseInPositions
  skip(72) // rest of financials
  vec(strategyPosition)
  skip(8 + 8) // maxAumSupply, seedId
  vec(pubkey) // roles.manager
  const curators = vec(pubkey)

  return { underlyingMint, statusFlags, aum, curators }
}

async function tvl(api) {
  const accounts = await getConnection().getProgramAccounts(EXPONENT_VAULTS_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(STRATEGY_VAULT_DISCRIMINATOR) } }],
  })

  let vaultCount = 0
  for (const { account } of accounts) {
    if (!account.data.includes(LOOPSCALE_CURATOR_BYTES)) continue // skip other curators' vaults before decoding
    const { underlyingMint, statusFlags, aum, curators } = decodeVault(account.data)
    if (!curators.includes(LOOPSCALE_CURATOR)) continue
    vaultCount++
    if (statusFlags === 8) continue // inactive, hidden in the UI (as in exponent-v2)
    api.add(SYNTHETIC_MINT_MAP[underlyingMint] || underlyingMint, aum)
  }
  if (!vaultCount) throw new Error('no Loopscale-curated Exponent vaults found')
}

module.exports = {
  timetravel: false,
  doublecounted: true, // vault deposits deploy into Loopscale markets and Exponent, both counted by their own adapters
  methodology:
    'TVL is the sum of AUM (idle assets plus deployed positions, denominated in each vault\'s underlying asset) across the Exponent strategy vaults whose curator role is Loopscale Asset Curation, read from the on-chain vault accounts.',
  solana: { tvl },
}
