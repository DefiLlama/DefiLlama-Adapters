const { getProvider } = require('../helper/solana')
const { Program, web3 } = require('@coral-xyz/anchor')
const idl = require('./omnipair_idl.json')

const PROGRAM_ID = 'omnixgS8fnqHfCcTGKWj6JtKjzpJZ1Y5y9pyFkQDkYE'

const COLLATERAL_VAULT_SEED = Buffer.from('collateral_vault')

let _programPromise

async function getProgram() {
  if (_programPromise) return _programPromise

  _programPromise = (async () => {
    const provider = getProvider()

    const omnipairIdl = { ...idl }
    omnipairIdl.address = PROGRAM_ID
    if (!omnipairIdl.metadata) omnipairIdl.metadata = {}
    omnipairIdl.metadata.address = PROGRAM_ID

    return new Program(omnipairIdl, provider)
  })()

  try {
    return await _programPromise
  } catch (e) {
    _programPromise = undefined
    throw e
  }
}

async function getFreshPairs() {
  const program = await getProgram()
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
}

function deriveVaultAddress(seed, pair, token) {
  const [vault] = web3.PublicKey.findProgramAddressSync(
    [
      seed,
      new web3.PublicKey(pair).toBuffer(),
      new web3.PublicKey(token).toBuffer(),
    ],
    new web3.PublicKey(PROGRAM_ID)
  )

  return vault.toBase58()
}

function isAccountNotFoundError(e) {
  const msg = String(e?.message || e || '').toLowerCase()

  return (
    msg.includes('could not find account') ||
    msg.includes('account not found') ||
    msg.includes('could not find') ||
    msg.includes('failed to find account') ||
    msg.includes('invalid param: could not find account')
  )
}

async function getTokenAccountBalance(connection, account) {
  try {
    const balance = await connection.getTokenAccountBalance(new web3.PublicKey(account))
    return balance?.value?.amount || '0'
  } catch (e) {
    if (isAccountNotFoundError(e)) return '0'
    throw e
  }
}

function addReserveSide(api, pair) {
  api.add(pair.token0, pair.cashReserve0)
  api.add(pair.token1, pair.cashReserve1)
}

async function addCollateralSide(api, connection, pair) {
  const collateral0Vault = deriveVaultAddress(COLLATERAL_VAULT_SEED, pair.pair, pair.token0)
  const collateral1Vault = deriveVaultAddress(COLLATERAL_VAULT_SEED, pair.pair, pair.token1)

  const [collateral0Balance, collateral1Balance] = await Promise.all([
    getTokenAccountBalance(connection, collateral0Vault),
    getTokenAccountBalance(connection, collateral1Vault),
  ])

  api.add(pair.token0, collateral0Balance)
  api.add(pair.token1, collateral1Balance)
}

async function tvl(api) {
  const provider = getProvider()
  const connection = provider.connection
  const pairs = await getFreshPairs()

  for (const pair of pairs) {
    addReserveSide(api, pair)
    await addCollateralSide(api, connection, pair)
  }
}

async function borrowed(api) {
  const pairs = await getFreshPairs()

  for (const pair of pairs) {
    api.add(pair.token0, pair.totalDebt0)
    api.add(pair.token1, pair.totalDebt1)
  }
}

module.exports = {
  methodology:
    'TVL counts assets currently locked in Omnipair reserve vaults via Pair account cashReserve0 and cashReserve1, plus all tokens locked in collateral vaults across all Pair accounts on Solana. Borrowed counts outstanding debt from totalDebt0 and totalDebt1 across all Pair accounts. Separately, Omnipair total deposits can be thought of as reserve exposure plus deposited collateral.',
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
}