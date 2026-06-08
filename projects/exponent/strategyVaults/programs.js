const { AnchorProvider, Program, web3 } = require('@coral-xyz/anchor')
const serumAnchor = require('@project-serum/anchor')

const {
  EXPONENT_CLMM_PROGRAM_ID,
  EXPONENT_CORE_PROGRAM_ID,
  EXPONENT_STRATEGY_VAULTS_PROGRAM_ID,
  KAMINO_LENDING_PROGRAM_ID,
  LOOPSCALE_PROGRAM_ID,
} = require('./constants')

const exponentVaultsIdl = require('./idls/exponent_vaults.json')
const exponentCoreIdl = require('./idls/exponent_core.json')
const exponentClmmIdl = require('./idls/exponent_clmm.json')
const loopscaleIdl = require('./idls/loopscale.json')
const kaminoLendingIdl = require('./idls/kamino_lending.json')

const MAX_MULTIPLE_ACCOUNTS = 100

class ReadOnlyWallet {
  constructor() {
    this.payer = web3.Keypair.generate()
    this.publicKey = this.payer.publicKey
  }

  async signTransaction(tx) {
    return tx
  }

  async signAllTransactions(txs) {
    return txs
  }
}

function withAddress(idl, programId) {
  return {
    ...idl,
    address: programId.toBase58(),
  }
}

function createCoralProgram(idl, programId, provider) {
  return new Program(withAddress(idl, programId), provider)
}

function createKaminoProgram(connection) {
  const provider = new serumAnchor.AnchorProvider(connection, new ReadOnlyWallet(), {})
  const idl = {
    ...kaminoLendingIdl,
    metadata: {
      ...(kaminoLendingIdl.metadata || {}),
      address: KAMINO_LENDING_PROGRAM_ID.toBase58(),
    },
  }

  return new serumAnchor.Program(idl, KAMINO_LENDING_PROGRAM_ID, provider)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRateLimitError(error) {
  return String(error?.message || error).includes('429') || String(error?.message || error).includes('Too Many Requests')
}

async function withRpcRetry(task, maxRetries = 5) {
  let delay = 1_000
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      if (!isRateLimitError(error) || attempt === maxRetries) throw error
      await sleep(delay)
      delay *= 2
    }
  }
  return null
}

function createStrategyVaultPrograms(connection) {
  const provider = new AnchorProvider(connection, new ReadOnlyWallet(), {})
  const accountCache = new Map()

  const accountInfoKey = (address) => `account:${address.toBase58()}`

  const getAccountInfo = async (address) => {
    const key = accountInfoKey(address)
    if (!accountCache.has(key)) accountCache.set(key, withRpcRetry(() => connection.getAccountInfo(address)))
    return accountCache.get(key)
  }

  const getMultipleAccountsInfo = async (addresses) => {
    const missingByKey = new Map()
    addresses.forEach((address) => {
      const key = accountInfoKey(address)
      if (!accountCache.has(key) && !missingByKey.has(key)) missingByKey.set(key, { key, address })
    })

    const missing = [...missingByKey.values()]
    for (let i = 0; i < missing.length; i += MAX_MULTIPLE_ACCOUNTS) {
      const chunk = missing.slice(i, i + MAX_MULTIPLE_ACCOUNTS)
      const chunkPromise = withRpcRetry(() => connection.getMultipleAccountsInfo(chunk.map(({ address }) => address)))
      chunk.forEach(({ key }, index) => {
        accountCache.set(key, chunkPromise.then((infos) => infos[index] || null))
      })
    }

    return Promise.all(addresses.map((address) => accountCache.get(accountInfoKey(address))))
  }

  const fetchAccount = async (program, accountName, address) => {
    const key = `${program.programId.toBase58()}:${accountName}:${address.toBase58()}`
    if (!accountCache.has(key)) accountCache.set(key, withRpcRetry(() => program.account[accountName].fetch(address)))
    return accountCache.get(key)
  }

  return {
    connection,
    cache: {
      fetchAccount,
      getAccountInfo,
      getMultipleAccountsInfo,
    },
    vaults: createCoralProgram(exponentVaultsIdl, EXPONENT_STRATEGY_VAULTS_PROGRAM_ID, provider),
    core: createCoralProgram(exponentCoreIdl, EXPONENT_CORE_PROGRAM_ID, provider),
    clmm: createCoralProgram(exponentClmmIdl, EXPONENT_CLMM_PROGRAM_ID, provider),
    loopscale: createCoralProgram(loopscaleIdl, LOOPSCALE_PROGRAM_ID, provider),
    kamino: createKaminoProgram(connection),
  }
}

module.exports = {
  createStrategyVaultPrograms,
}
