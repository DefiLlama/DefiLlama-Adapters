const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')
const { decodeAccount } = require('../helper/utils/solana/layout')
const { PublicKey } = require('@solana/web3.js')

const RASOL_STAKE_POOL = 'ECRqn7gaNASuvTyC5xfCUjehWZCSowMXstZiM5DNweyB'
const HUBRA_VOTE_ACCOUNT = '7K8DVxtNJGnMtUY1CQJT5jcs8sFGSZTDiG7kowvFpECh'

// SPL stake pool ValidatorList: 1-byte account_type + 4-byte max_validators + 4-byte vec_len + entries
// ValidatorStakeInfo entry (73 bytes): active(u64) | transient(u64) | last_update_epoch(u64)
//   | transient_seed_suffix(u64) | unused(u32) | validator_seed_suffix(u32) | status(u8) | vote_pubkey(32)
const VL_HEADER = 9
const VL_ENTRY = 73

// Voltr vault account layout: asset mint at offset 104 (32 bytes), totalValue (u64 LE) at offset 168
const EARN_VAULTS = [
  '3maCuTJVPteZ2dFA8dADxz2EbpJHfoAG5txYhXDs6gNQ', // USDC
  '663azFYEnHDTLGf4CEk8KpNTje8XxZVLnQwo9LjbSejy', // USD1
  '3kzb6rcDJxSdkWCwXXP9PULSqBy6rVDNWanzw5dBCYCj', // USDT
  '5mv1cURMSaPU3q3wFVoN4mKMWNFVvUtH3UZrG4Z2Mgfz', // USDS
  '7VZ1XKK7Zns6UzRc1Wz54u6cypN7zaduasVXXr7NysxH', // USDG
]

async function tvl(api) {
  const connection = getConnection()

  // raSOL liquid staking: SPL stake pool totalLamports = SOL backing the LST
  const poolInfo = await connection.getAccountInfo(new PublicKey(RASOL_STAKE_POOL))
  const pool = decodeAccount('stakePool', poolInfo)
  api.add(ADDRESSES.solana.SOL, pool.totalLamports.toString())

  // Hubra validator: SOL delegated to the vote account, minus the portion already provided
  // by the raSOL stake pool (otherwise raSOL's delegation would be counted twice).
  const [vlInfo, voteAccounts] = await Promise.all([
    connection.getAccountInfo(pool.validatorList),
    connection.getVoteAccounts(),
  ])

  let poolStakeToValidator = 0n
  if (vlInfo) {
    const buf = vlInfo.data
    const count = buf.readUInt32LE(5)
    for (let i = 0; i < count; i++) {
      const off = VL_HEADER + i * VL_ENTRY
      const vote = new PublicKey(buf.slice(off + 41, off + 73)).toBase58()
      if (vote !== HUBRA_VOTE_ACCOUNT) continue
      poolStakeToValidator += buf.readBigUInt64LE(off)      // active
      poolStakeToValidator += buf.readBigUInt64LE(off + 8)  // transient
    }
  }

  const validator = voteAccounts.current.find(v => v.votePubkey === HUBRA_VOTE_ACCOUNT)
    || voteAccounts.delinquent.find(v => v.votePubkey === HUBRA_VOTE_ACCOUNT)
  if (validator) {
    const direct = BigInt(validator.activatedStake) - poolStakeToValidator
    if (direct > 0n) api.add(ADDRESSES.solana.SOL, direct.toString())
  }

  // Hubra Earn (Voltr) vaults — read asset mint + totalValue from on-chain account data
  const accounts = await connection.getMultipleAccountsInfo(EARN_VAULTS.map(v => new PublicKey(v)))
  for (const account of accounts) {
    if (!account || account.data.length < 176) continue
    const asset = new PublicKey(account.data.slice(104, 136)).toBase58()
    const totalValue = account.data.readBigUInt64LE(168)
    if (totalValue > 0n) api.add(asset, totalValue.toString())
  }
}

module.exports = {
  methodology: 'TVL aggregates: (1) SOL backing raSOL — the SPL stake pool\'s totalLamports; (2) SOL delegated directly to Hubra\'s validator vote account, with the raSOL stake pool\'s own delegation subtracted to avoid double-counting; (3) underlying assets held in Hubra Earn vaults (Voltr) — stablecoin vaults (USDC, USD1, USDT, USDS, USDG) — read directly from on-chain account data.',
  solana: { tvl },
}
