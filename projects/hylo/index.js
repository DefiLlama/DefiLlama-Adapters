const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { getConnection, getAssociatedTokenAddress, sumTokens2 } = require('../helper/solana')

// Hylo is a CDP protocol: users deposit collateral to mint hyUSD (stablecoin)
// and xSOL (liquidation-free leveraged SOL). TVL is the collateral sitting in
// the exchange program's vaults.
const EXCHANGE_PROGRAM = new PublicKey('HYEXCHtHkBagdStcJCp3xbbb9B7sdMdWXFNj6mdsG4hn')

const USDC = ADDRESSES.solana.USDC

// Account layouts from the on-chain IDL (hylo_exchange v2.0.5). Each collateral
// type gets its own account, whose fixed size we filter on, and each stores its
// collateral mint as the first field (offset 8, right after the discriminator).
// The vault itself is the associated token account of a per-collateral
// authority PDA, so the mint is all we need to locate it.
const COLLATERAL_ACCOUNTS = [
  { name: 'LstHeader', dataSize: 211, vaultAuthSeed: 'vault_auth' },
  { name: 'ExoPair', dataSize: 405, vaultAuthSeed: 'exo_vault_auth' },
  // UsdcPair has no collateral mint field - that pair is always USDC.
  { name: 'UsdcPair', dataSize: 173, vaultAuthSeed: 'usdc_vault_auth', mint: USDC },
]

async function getCollateralVaults() {
  const connection = getConnection()

  const vaults = await Promise.all(COLLATERAL_ACCOUNTS.map(async ({ dataSize, vaultAuthSeed, mint: fixedMint }) => {
    // dataSlice keeps the response to the discriminator + mint rather than the
    // full account, since the mint is the only field we read.
    const accounts = await connection.getProgramAccounts(EXCHANGE_PROGRAM, {
      dataSlice: { offset: 8, length: 32 },
      filters: [{ dataSize }],
    })

    return accounts.map(({ account }) => {
      const mint = fixedMint ? new PublicKey(fixedMint) : new PublicKey(account.data)
      const [vaultAuth] = PublicKey.findProgramAddressSync(
        [Buffer.from(vaultAuthSeed), mint.toBuffer()],
        EXCHANGE_PROGRAM
      )
      return getAssociatedTokenAddress(mint, vaultAuth)
    })
  }))

  return vaults.flat()
}

async function tvl(api) {
  const tokenAccounts = await getCollateralVaults()
  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the collateral (LSTs, cbBTC and USDC) held in the Hylo exchange program vaults backing hyUSD and xSOL. Vault addresses are derived on-chain from the program\'s LstHeader, ExoPair and UsdcPair accounts.',
  solana: { tvl },
}
