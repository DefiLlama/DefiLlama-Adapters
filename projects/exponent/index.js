const { getConnection, getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { decodeAccount } = require('../helper/utils/solana/layout')
const { Program } = require('@coral-xyz/anchor')

const { getConfig } = require('../helper/cache')
const idl = require('./idl.json')
const vaultsIdl = require('./vaults_idl.json')

const SYNTHETIC_MINT_MAP = {
  'USD1111111111111111111111111111111111111111': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // synthetic USD -> USDC
  'USD1111111111111111111111111111111111111119': 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT', // synthetic USD9 -> USDe
}

async function addCoreTvl(api) {
  const provider = getProvider()
  const connection = getConnection()
  
  const program = new Program(idl, provider)
  const vaults = await program.account.vault.all()
  
  const mintRateMap = {}
  const mintAccountMap = {}
  
  vaults.forEach(v => {
    const rate = v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12
    if (rate > 0)
      mintRateMap[v.account.mintSy.toString()] = v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12
  })

  // Fetch mint accounts
  const mintPubkeys = Object.keys(mintRateMap).map(k => new PublicKey(k))
  const mintAccounts = await connection.getMultipleAccountsInfo(mintPubkeys);


  mintAccounts.forEach((a, i) => {
    mintAccountMap[mintPubkeys[i].toString()] = a
  })
  
  // Fetch Exponent wrapped mints from Exponent API
  const { data: mints } = await getConfig('exponent', 'https://web-api.exponent.finance/api/lyt-growth/standard-yield-tokens');
  

  for (let i = 0; i < mints.length; i++) {
    const { mintSy, mintUnderlying} = mints[i]
    const mintAccount = mintAccountMap[mintSy]
    const mintRate = mintRateMap[mintSy]
    if (!mintAccount || !mintRate) continue;

    // Decode mint data
    const decodedMint = decodeAccount('mint', mintAccount);
    const supply = decodedMint.supply;

    // As all of the Exponent wrapped tokens are yield bearing tokens, mutiply their supply by their redemption rate to get the base asset amount
    const amount = supply * mintRate;

    // Add to balances using the base asset price * the converted amount of base tokens
    api.add(mintUnderlying, amount);
  }
}

async function addManagedVaultAum(api) {
  const program = new Program(vaultsIdl, getProvider())
  const vaults = await program.account.exponentStrategyVault.all()
  for (const { account } of vaults) {
    // skip non-active vaults that aren't shown on the UI
    if (account.statusFlags === 8) continue
    const total = BigInt(account.financials.aumInBase.toString()) + BigInt(account.financials.aumInBaseInPositions.toString())
    if (total <= 0n) continue
    const mint = account.underlyingMint.toBase58()
    api.add(SYNTHETIC_MINT_MAP[mint] || mint, total)
  }
}

async function tvl(api) {
  await addCoreTvl(api)
  await addManagedVaultAum(api)
}

module.exports = {
  timetravel: false,
  methodology: 'Core TVL: sum the total supply of each Exponent wrapped yield-bearing token multiplied by its on-chain last-seen SY exchange rate, emitted under the underlying mint from the Exponent API. Managed vault TVL: read each strategy vault\'s on-chain `aumInBase` (idle reserves) and `aumInBaseInPositions` (value of deployed positions).',
  solana: { tvl },
}
