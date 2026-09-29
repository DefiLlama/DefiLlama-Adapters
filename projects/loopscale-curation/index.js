const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

// Loopscale Asset Curation vaults are Exponent strategy vaults
// (program sVau1tXvayVWfotzm9Ahcv2qfnnfRWttt78BCnNC6dD) curated by Loopscale.
// Each vault is managed by its own Squads multisig, so there is no single
// on-chain curator key to discover by — new vaults must be added here.
const CURATED_VAULTS = [
  '63q8q952GEsJsjsQuFFJRnYDf7NBpcMLLxFuFGyYWg6C', // SOL Main
  '9iPUphFXxnyAKYnCTG3XZv5ybHv5Ki1diqA5mis3TBVB', // OnRe Growth
  'CafHV1mnD4iRsTetmM9iULj1Cuui7PVbPo3hGxWi3x1K', // PST Loop Vault
  'BWuXMAURGyehq9AWCDDY79YE88ADkgYKr9wGw3Y3nVd8', // Doma SOL Internet Vault
  'EsTx9ToYW2k1DsTw6ccpmP3RrXQriod114hcM7U5ZKaR', // DAWN Liquidity
]

const STRATEGY_VAULT_DISCRIMINATOR = Buffer.from([98, 228, 39, 201, 116, 210, 39, 11])

// Exponent's abstract USD quote sentinel. Vaults quoted in it (e.g. OnRe
// Growth) hold USD-denominated positions with 6 decimals, so map 1:1 to USDC.
const USD_QUOTE_MINT = 'USD1111111111111111111111111111111111111111'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

// Minimal walk of the ExponentStrategyVault account. The account is
// borsh-encoded with variable-length vectors ahead of the fields we need, so
// we skip forward field by field until financials.
//
// Layout (from the exponent SDK's ExponentStrategyVaultAccountDataCodec):
//   discriminator [8] | navAumCircuitBreakerState [32] | squadsSettings [32]
//   | squadsVault [32] | tokenEntries vec | underlyingMint [32] | mintLp [32]
//   | tokenLpEscrow [32] | normalWithdrawalCutBp u16 | feeTreasury [32]
//   | selfAddress [32] | signerBump [1] | statusFlags u8 | financials { ... }
function decodeVaultAum(data) {
  if (!data.subarray(0, 8).equals(STRATEGY_VAULT_DISCRIMINATOR))
    throw new Error('unexpected ExponentStrategyVault discriminator')

  let offset = 8 + 32 + 32 + 32

  const readU32 = () => { const v = data.readUInt32LE(offset); offset += 4; return v }
  const readU64 = () => { const v = data.readBigUInt64LE(offset); offset += 8; return v }

  // tokenEntries: vec<TokenEntry>
  // TokenEntry: mint [32] | priceId | tokenSquadsAccount [32]
  //   | tokenAccountVault [32] | lastObservedAmount u64
  //   | forceDeallocatePolicyIds vec<u64>
  // PriceId enum: 0 => Simple(u64), 1 => Multiply(vec<u64>)
  const tokenEntryCount = readU32()
  for (let i = 0; i < tokenEntryCount; i++) {
    offset += 32 // mint
    const priceIdKind = data.readUInt8(offset); offset += 1
    if (priceIdKind === 0) offset += 8
    else if (priceIdKind === 1) offset += 4 + readAheadVecLen() * 8
    else throw new Error('unknown Exponent PriceId variant')
    offset += 32 + 32 + 8 // tokenSquadsAccount, tokenAccountVault, lastObservedAmount
    offset += 4 + readAheadVecLen() * 8 // forceDeallocatePolicyIds

    function readAheadVecLen() { return data.readUInt32LE(offset) }
  }

  let underlyingMint = new PublicKey(data.subarray(offset, offset + 32)).toString()
  if (underlyingMint === USD_QUOTE_MINT) underlyingMint = USDC_MINT
  offset += 32 // underlyingMint
  offset += 32 + 32 // mintLp, tokenLpEscrow
  offset += 2 // normalWithdrawalCutBp
  offset += 32 + 32 // feeTreasury, selfAddress
  offset += 1 + 1 // signerBump, statusFlags

  // financials: lpBalance u64 | aumInBase u64 | aumInBaseInPositions u64 | ...
  offset += 8 // lpBalance
  const aumInBase = readU64()
  const aumInBaseInPositions = readU64()

  return { underlyingMint, aum: aumInBase + aumInBaseInPositions }
}

async function tvl(api) {
  const connection = getConnection()
  const accounts = await connection.getMultipleAccountsInfo(
    CURATED_VAULTS.map((a) => new PublicKey(a))
  )

  const balances = {}
  accounts.forEach((account, i) => {
    if (!account) throw new Error(`vault account missing: ${CURATED_VAULTS[i]}`)
    const { underlyingMint, aum } = decodeVaultAum(account.data)
    balances[underlyingMint] = (balances[underlyingMint] ?? 0n) + aum
  })

  const entries = Object.entries(balances)
  api.addTokens(entries.map(([mint]) => mint), entries.map(([, aum]) => aum))
}

module.exports = {
  timetravel: false,
  doublecounted: true, // vault deposits deploy into Loopscale markets and Exponent, both counted by their own adapters
  methodology:
    'TVL is the sum of AUM (idle assets plus deployed positions, denominated in each vault\'s underlying asset) across Loopscale Asset Curation vaults, read from the on-chain vault accounts.',
  solana: { tvl },
}
