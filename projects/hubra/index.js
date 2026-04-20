const { getSolBalanceFromStakePool, getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const RASOL_STAKE_POOL = 'ECRqn7gaNASuvTyC5xfCUjehWZCSowMXstZiM5DNweyB'

// Voltr vault account layout:
// offset 104: asset mint (pubkey, 32 bytes)
// offset 168: totalValue (u64, 8 bytes)
const EARN_VAULTS = [
  '3maCuTJVPteZ2dFA8dADxz2EbpJHfoAG5txYhXDs6gNQ', // USDC
  '663azFYEnHDTLGf4CEk8KpNTje8XxZVLnQwo9LjbSejy', // USD1
  '3kzb6rcDJxSdkWCwXXP9PULSqBy6rVDNWanzw5dBCYCj', // USDT
  '5mv1cURMSaPU3q3wFVoN4mKMWNFVvUtH3UZrG4Z2Mgfz', // USDS
  '7VZ1XKK7Zns6UzRc1Wz54u6cypN7zaduasVXXr7NysxH', // USDG
]

async function tvl(api) {
  await getSolBalanceFromStakePool(RASOL_STAKE_POOL, api)

  const connection = getConnection()
  const accounts = await connection.getMultipleAccountsInfo(EARN_VAULTS.map(v => new PublicKey(v)))
  for (const account of accounts) {
    if (!account || account.data.length < 176) continue
    const asset = new PublicKey(account.data.slice(104, 136)).toBase58()
    const totalValue = account.data.readBigUInt64LE(168)
    if (totalValue > 0n) api.add(asset, totalValue.toString())
  }
}

module.exports = {
  methodology: 'TVL is the SOL backing raSOL (from the SPL stake pool) plus the underlying stablecoins held in Hubra Earn vaults (Voltr), read directly from on-chain vault account data.',
  solana: { tvl },
}
