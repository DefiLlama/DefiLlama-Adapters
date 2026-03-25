const { getProvider } = require('../helper/solana')
const { Program } = require('@coral-xyz/anchor')
const idl = require('./omnipair_idl.json')

const PROGRAM_ID = 'omnixgS8fnqHfCcTGKWj6JtKjzpJZ1Y5y9pyFkQDkYE'

let _pairsPromise

async function getPairs() {
  if (_pairsPromise) return _pairsPromise

  _pairsPromise = (async () => {
    const provider = getProvider()

    const omnipairIdl = { ...idl }
    omnipairIdl.address = PROGRAM_ID
    if (!omnipairIdl.metadata) omnipairIdl.metadata = {}
    omnipairIdl.metadata.address = PROGRAM_ID

    const program = new Program(omnipairIdl, provider)
    const pairs = await program.account.pair.all()

    return pairs.map(({ publicKey, account }) => ({
      pair: publicKey.toBase58(),
      token0: account.token0.toBase58(),
      token1: account.token1.toBase58(),
      lpMint: account.lpMint.toBase58(),
      reserve0: account.reserve0.toString(),
      reserve1: account.reserve1.toString(),
      cashReserve0: account.cashReserve0.toString(),
      cashReserve1: account.cashReserve1.toString(),
      totalDebt0: account.totalDebt0.toString(),
      totalDebt1: account.totalDebt1.toString(),
      totalCollateral0: account.totalCollateral0.toString(),
      totalCollateral1: account.totalCollateral1.toString(),
    }))
  })()

  return _pairsPromise
}

async function tvl(api) {
  const pairs = await getPairs()

  for (const pair of pairs) {
    api.add(pair.token0, pair.reserve0)
    api.add(pair.token1, pair.reserve1)
  }
}

async function borrowed(api) {
  const pairs = await getPairs()

  for (const pair of pairs) {
    api.add(pair.token0, pair.totalDebt0)
    api.add(pair.token1, pair.totalDebt1)
  }
}

module.exports = {
  methodology:
    'TVL counts Omnipair pool reserves from all Pair accounts on Solana. Borrowed counts outstanding pair debt totals from all Pair accounts.',
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
}