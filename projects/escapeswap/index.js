const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const SWAP_PROGRAM = 'EscapeSwCMQocQoabyGaXDyN1BmhCR6orUV7kmxFRmY'
const POOL_STATE_SIZE = 205
const POOL_STATE_DISCRIMINATOR = 'iUE1qg7KXeV' // f7ede3f5d7c3de46
const OFFSET_TOKEN_0_VAULT = 8
const OFFSET_TOKEN_1_VAULT = 40
const OFFSET_TOKEN_0_MINT = 72
const OFFSET_TOKEN_1_MINT = 104

const readKey = (data, offset) => new PublicKey(data.subarray(offset, offset + 32)).toBase58()

async function tvl(api) {
  const connection = getProvider().connection
  const pools = await connection.getProgramAccounts(new PublicKey(SWAP_PROGRAM), {
    filters: [
      { dataSize: POOL_STATE_SIZE },
      { memcmp: { offset: 0, bytes: POOL_STATE_DISCRIMINATOR } },
    ],
  })
  const tokenAccounts = []
  for (const { account } of pools) {
    const data = account.data
    if (readKey(data, OFFSET_TOKEN_0_MINT) === ADDRESSES.solana.SOL) tokenAccounts.push(readKey(data, OFFSET_TOKEN_0_VAULT))
    else if (readKey(data, OFFSET_TOKEN_1_MINT) === ADDRESSES.solana.SOL) tokenAccounts.push(readKey(data, OFFSET_TOKEN_1_VAULT))
  }
  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology: 'Counts SOL in EscapeSwap pools (wSOL vault of every pool). Launched tokens are not counted.',
  solana: { tvl },
}
