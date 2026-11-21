const { PublicKey } = require("@solana/web3.js");
const { chains: { svm } } = require('@defillama/sdk')
const { getStakedSol, sumTokens2 } = require("../helper/solana")

const pool = '9nyw5jxhzuSs88HxKJyDCsWBZMhxj2uNXsFcyHF5KBAb'
// Stake pool programs accepted by the protocol's liquid-unstaker client.
const stakePoolPrograms = [
  'SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy',
  'SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY',
  'SPMBzsVUuoHA4Jm6KunbsotaahvVikZs1JyTW6iJvbn',
]

async function tvl(api) {
  // Unstake pool: https://docs.thevault.finance/products/unstake-pool
  // Program: https://solscan.io/account/2rU1oCHtQ7WJUvy15tKtFvxdYNNSc3id7AzUcjeFSddo
  // Stake account: https://solscan.io/account/9nyw5jxhzuSs88HxKJyDCsWBZMhxj2uNXsFcyHF5KBAb#defiactivities
  // Liquid stake: https://solscan.io/account/6RLKARrt6oPCyuMCdYdUHmJxd4wUa6ZeyiC8VSMcYxRv

  await getStakedSol(pool, api);
  await sumTokens2({
    api,
    solOwners: [new PublicKey('6RLKARrt6oPCyuMCdYdUHmJxd4wUa6ZeyiC8VSMcYxRv')]
  })

  // The pool receives LSTs in exchange for SOL. Ignore unsolicited non-LST tokens.
  const stakePools = await Promise.all(stakePoolPrograms.map(programId => svm.getProgramAccounts({
    programId, filters: [{ dataSize: 611 }], dataSlice: { offset: 162, length: 32 },
  })))
  const lstMints = new Set(stakePools.flat().map(({ account }) => new PublicKey(Buffer.from(account.data[0], 'base64')).toBase58()))
  const accounts = await Promise.all([svm.TOKEN_PROGRAM_ID, svm.TOKEN_2022_PROGRAM_ID].map(programId =>
    svm.call({ method: 'getTokenAccountsByOwner', params: [pool, { programId }, { encoding: 'jsonParsed' }] })))
  for (const { value } of accounts) {
    for (const { account } of value) {
      const { mint, tokenAmount } = account.data.parsed.info
      if (lstMints.has(mint)) api.add(mint, tokenAmount.amount)
    }
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};
