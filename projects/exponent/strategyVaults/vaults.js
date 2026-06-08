const bs58Module = require('bs58')

const { EXPONENT_STRATEGY_VAULT_DISCRIMINATOR, EXPONENT_STRATEGY_VAULTS_PROGRAM_ID } = require('./constants')

const bs58 = bs58Module.default || bs58Module
const TOKEN_ENTRIES_VEC_OFFSET = 104
const MAX_TOKEN_ENTRIES = 64

const IGNORED_VAULTS = new Set([
  'Fo7vvPsSqNAYy2S7CpQoVFP8Ygnr22xB3fJVhde9GjcB',
  '7apbV7QJHFhh5Ueczg35n6StyNdqeMmDdRwKDNCSRm7i',
  'GsT257ZWjLboYAbWE1qDX2irHSyvCviQatyu3g2DSqmb',
  '3KUQ8H5v4pLthqCsdPZuMnwjHVJcdkiFeWZGdX3Mr7MX',
  '79aYbxCzLNFiF3tibivW6kva8B5qcFUAPAGweDuAyfMY',
  '99RpUEbUMe1chVgpJNV16iXaJqdfvm459siFX9SA75nq',
  'E957xxdpgsCbmqHo9AyHkLRTvgppxgQbZ9V8QXpQegg5',
  'F9Tv2qBbS1YnsR4hYyaq6ztPUcTpht1ZT5Gb22DFwyg1',
  'FKif7QNqt6cSaFj9cGL8eCz9cuSncKvbVNHxzd92r2hY',
  'GfT6RcToh5mmkJ5DpPSBsBSJzun2WyVcsWXzNCtEfVUa',
  'HUXvqaGbjX8kZ65ZhMhJgzfrjEX5By2gA8x9Z9mEFfQH',
  'Hyi6LoTzcHpaQueSz4qqFdWeBydihpkRR8CqFvLWspqH',
])

async function fetchStrategyVaultAccounts(programs) {
  const rawAccounts = await programs.connection.getProgramAccounts(EXPONENT_STRATEGY_VAULTS_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(EXPONENT_STRATEGY_VAULT_DISCRIMINATOR),
        },
      },
    ],
  })

  const decoded = []
  rawAccounts.forEach(({ pubkey, account }) => {
    if (IGNORED_VAULTS.has(pubkey.toBase58())) return
    if (account.data.length < TOKEN_ENTRIES_VEC_OFFSET + 4) return
    if (account.data.readUInt32LE(TOKEN_ENTRIES_VEC_OFFSET) > MAX_TOKEN_ENTRIES) return

    try {
      decoded.push({
        publicKey: pubkey,
        account: programs.vaults.coder.accounts.decode('exponentStrategyVault', account.data),
      })
    } catch (error) {
      console.warn('Failed to decode Exponent strategy vault account', {
        vaultAddress: pubkey.toBase58(),
        error,
      })
    }
  })

  return decoded
}

module.exports = {
  fetchStrategyVaultAccounts,
}
