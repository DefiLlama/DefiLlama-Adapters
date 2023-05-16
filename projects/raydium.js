const { getConnection, sumTokens2, decodeAccount, getValidGeckoSolTokens, } = require("./helper/solana");
const { PublicKey, } = require("@solana/web3.js");
const sdk = require('@defillama/sdk')

const CLMM = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK'
const AmmV4 = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
const AmmStable = '5quBtoiQqxF9Jv6KYKctB59NT3gtJD2Y65kdnB1Uev3h'

async function ammStableTvl() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(AmmStable), {
    filters: [{
      dataSize: 1232
    }]
  })
  const data = accounts.map(i => decodeAccount('raydiumLPStable', i.account))
  const tokenAccounts = data.map(i => [i.baseVault, i.quoteVault]).flat().map(i => i.toString())
  return sumTokens2({ tokenAccounts })
}

async function tvlCLMM() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(CLMM), {
    filters: [{
      dataSize: 1544
    }]
  })
  const data = accounts.map(i => decodeAccount('raydiumCLMM', i.account))
  const tokenAccounts = data.map(i => [i.vaultA, i.vaultB]).flat().map(i => i.toString())
  return sumTokens2({ tokenAccounts })
}


async function ammV4Tvl() {
  const owner = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
  return sumTokens2({ owner, tokens: [...await getValidGeckoSolTokens()], blacklistedTokens: [
    '674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7', // $WOOD
    'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd', // SNS
    'A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g', // ZION
    'RdFHYW7mPJouuSpb5vEzUfbHeQedmQMuCoHN4VQkUDn', // LUCHOW
    'RFn7mUjf24UFMBdDVmoggAii4gyHdRDDqmKzGVbkd8c', // FOUR
    'FTD9EisrsMt5TW5wSTMqyXLh2o7xTb6KNuTiXgHhw8Q8', // POLYPLAY
  ]})
}



module.exports = {
  timetravel: false,
  hallmarks: [[1667865600, "FTX collapse"]],
  solana: {
    tvl: sdk.util.sumChainTvls([tvlCLMM, ammStableTvl, ammV4Tvl]),
  },
};