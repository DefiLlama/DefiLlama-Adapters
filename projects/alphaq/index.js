const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

const PROGRAM_ID = new PublicKey('ALPHAQmeA7bjrVuccPsYPiCvsi428SNwte66Srvs4pHA')
const MARKET_ACCOUNT_SIZE = 672
const VAULTS_OFFSET = 112

async function tvl(api) {
  const markets = await getConnection().getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: MARKET_ACCOUNT_SIZE }],
    dataSlice: { offset: VAULTS_OFFSET, length: 64 },
  })

  const vaults = new Set()
  for (const { account } of markets) {
    vaults.add(new PublicKey(account.data.subarray(0, 32)).toBase58())
    vaults.add(new PublicKey(account.data.subarray(32, 64)).toBase58())
  }

  return sumTokens2({ api, tokenAccounts: [...vaults] })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the value of assets held in the two token vaults recorded by every AlphaQ market account on Solana.',
  solana: { tvl },
}
