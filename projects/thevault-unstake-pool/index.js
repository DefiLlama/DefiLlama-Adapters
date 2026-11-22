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
  const lstMints = new Set()
  for (const programId of stakePoolPrograms) {
    const stakePools = await svm.getProgramAccounts({
      programId, filters: [{ dataSize: 611 }], dataSlice: { offset: 162, length: 32 },
    })
    for (const { account } of stakePools)
      lstMints.add(new PublicKey(Buffer.from(account.data[0], 'base64')).toBase58())
  }
  for (const programId of [svm.TOKEN_PROGRAM_ID, svm.TOKEN_2022_PROGRAM_ID]) {
    const { value } = await svm.call({ method: 'getTokenAccountsByOwner', params: [pool, { programId }, { encoding: 'jsonParsed' }] })
    for (const { account } of value) {
      const { mint, tokenAmount } = account.data.parsed.info
      if (lstMints.has(mint)) api.add(mint, tokenAmount.amount)
    }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'SOL and stake accounts held by the unstake pool, plus the liquid staking tokens it has received in exchange for SOL. Other tokens sent to the pool are ignored.',
  solana: {
    tvl
  },
};
