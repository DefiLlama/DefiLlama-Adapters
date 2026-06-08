const { PublicKey } = require('@solana/web3.js')

const bs58Module = require('bs58')
const bs58 = bs58Module.default || bs58Module

const EXPONENT_STRATEGY_VAULTS_PROGRAM_ID = new PublicKey(
  'sVau1tXvayVWfotzm9Ahcv2qfnnfRWttt78BCnNC6dD'
)

const EXPONENT_STRATEGY_VAULT_DISCRIMINATOR = Buffer.from([
  98, 228, 39, 201, 116, 210, 39, 11,
])

const SYNTHETIC_USD_MINT = 'USD1111111111111111111111111111111111111111'
const SYNTHETIC_USD9_MINT = 'USD1111111111111111111111111111111111111119'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDE_MINT = 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT'

const U64_SIZE = 8
const PUBLIC_KEY_SIZE = 32

function resolveManagedUnderlyingMint(underlyingMint) {
  if (underlyingMint === SYNTHETIC_USD_MINT) return USDC_MINT
  if (underlyingMint === SYNTHETIC_USD9_MINT) return USDE_MINT
  return underlyingMint
}

function assertCanRead(data, offset, length) {
  if (offset < 0 || offset + length > data.length) {
    throw new Error(`Exponent strategy vault account data too short at offset ${offset}`)
  }
}

function readU32LE(data, offset) {
  assertCanRead(data, offset, 4)
  return data.readUInt32LE(offset)
}

function readU64LE(data, offset) {
  assertCanRead(data, offset, U64_SIZE)
  return data.readBigUInt64LE(offset)
}

function readPublicKey(data, offset) {
  assertCanRead(data, offset, PUBLIC_KEY_SIZE)
  return new PublicKey(data.subarray(offset, offset + PUBLIC_KEY_SIZE)).toBase58()
}

function skipU64Vec(data, offset) {
  const length = readU32LE(data, offset)
  return offset + 4 + length * U64_SIZE
}

function skipPriceId(data, offset) {
  assertCanRead(data, offset, 1)
  const variant = data.readUInt8(offset)
  offset += 1

  if (variant === 0) {
    return offset + U64_SIZE
  }

  if (variant === 1) {
    return skipU64Vec(data, offset)
  }

  throw new Error(`Unknown Exponent strategy vault PriceId variant ${variant}`)
}

function skipTokenEntry(data, offset) {
  offset += PUBLIC_KEY_SIZE
  offset = skipPriceId(data, offset)
  offset += PUBLIC_KEY_SIZE
  offset += PUBLIC_KEY_SIZE
  offset += U64_SIZE
  offset = skipU64Vec(data, offset)
  assertCanRead(data, offset, 0)
  return offset
}

function parseStrategyVaultAum(data) {
  const buffer = Buffer.from(data)
  assertCanRead(buffer, 0, EXPONENT_STRATEGY_VAULT_DISCRIMINATOR.length)

  if (!buffer.subarray(0, 8).equals(EXPONENT_STRATEGY_VAULT_DISCRIMINATOR)) {
    throw new Error('Invalid Exponent strategy vault discriminator')
  }

  let offset = 8
  offset += PUBLIC_KEY_SIZE // nav_aum_circuit_breaker_state
  offset += PUBLIC_KEY_SIZE // squads_settings
  offset += PUBLIC_KEY_SIZE // squads_vault

  const tokenEntriesLength = readU32LE(buffer, offset)
  offset += 4
  for (let i = 0; i < tokenEntriesLength; i += 1) {
    offset = skipTokenEntry(buffer, offset)
  }

  const underlyingMint = readPublicKey(buffer, offset)
  offset += PUBLIC_KEY_SIZE
  offset += PUBLIC_KEY_SIZE // mint_lp
  offset += PUBLIC_KEY_SIZE // token_lp_escrow
  offset += 2 // normal_withdrawal_cut_bp
  offset += PUBLIC_KEY_SIZE // fee_treasury
  offset += PUBLIC_KEY_SIZE // self_address
  offset += 1 // signer_bump
  offset += 1 // status_flags

  const aumInBase = readU64LE(buffer, offset + U64_SIZE)
  const aumInBaseInPositions = readU64LE(buffer, offset + U64_SIZE * 2)

  return {
    underlyingMint,
    aumRaw: aumInBase + aumInBaseInPositions,
  }
}

async function fetchStrategyVaultAums(connection) {
  const accounts = await connection.getProgramAccounts(EXPONENT_STRATEGY_VAULTS_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(EXPONENT_STRATEGY_VAULT_DISCRIMINATOR),
        },
      },
    ],
  })

  const vaultAums = []
  accounts.forEach(({ pubkey, account }) => {
    try {
      vaultAums.push({
        vaultAddress: pubkey.toBase58(),
        ...parseStrategyVaultAum(account.data),
      })
    } catch (error) {
      console.warn('Failed to decode Exponent strategy vault account', {
        vaultAddress: pubkey.toBase58(),
        error,
      })
    }
  })

  return vaultAums
}

module.exports = {
  fetchStrategyVaultAums,
  resolveManagedUnderlyingMint,
}
