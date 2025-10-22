const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance } = require('../helper/chain/near')

const TEMPLAR_REGISTRY_CONTRACTS = [
  'v1.tmplr.near',
]

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000
const CALL_TIMEOUT_MS = 30000

const sleep = (ms) =>  new Promise(resolve => setTimeout(resolve, ms))

async function withRetry(fn, maxAttempts = MAX_RETRY_ATTEMPTS, delayMs = RETRY_DELAY_MS) {
  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === maxAttempts) throw lastError
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms: ${error.message}`)
      await sleep(delayMs)
      delayMs *= 1.5
    }
  }
}

async function safeCall(contractId, method, args = {}) {
  if (!contractId || typeof contractId !== 'string') throw new Error(`Invalid contract ID: ${contractId}`)
  if (!method || typeof method !== 'string') throw new Error(`Invalid method name: ${method}`)

  return withRetry(async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Call timeout after ${CALL_TIMEOUT_MS}ms`)), CALL_TIMEOUT_MS)
    })
    const callPromise = call(contractId, method, args)
    return Promise.race([callPromise, timeoutPromise])
  })
}

function extractTokenAddress(assetConfig, assetType) {
  if (!assetConfig || typeof assetConfig !== 'object') {
    throw new Error(`Invalid ${assetType} asset config: not an object`)
  }

  if (assetConfig.Nep141) {
    if (typeof assetConfig.Nep141 !== 'string' || assetConfig.Nep141.length === 0) {
      throw new Error(`Invalid NEP-141 address for ${assetType} asset`)
    }
    return assetConfig.Nep141
  }

  if (assetConfig.Nep245?.token_id) {
    const tokenId = assetConfig.Nep245.token_id
    if (typeof tokenId !== 'string' || tokenId.length === 0) {
      throw new Error(`Invalid NEP-245 token ID for ${assetType} asset`)
    }
    const parts = tokenId.split(':')
    if (parts.length !== 2) {
      throw new Error(`Invalid NEP-245 token ID format for ${assetType} asset: ${tokenId}`)
    }
    if (parts[0] === 'nep141') {
      if (parts[1].length === 0) {
        throw new Error(`Empty NEP-141 address in NEP-245 token for ${assetType} asset`)
      }
      return parts[1]
    }
    throw new Error(`Unsupported NEP-245 token type for ${assetType} asset: ${parts[0]}`)
  }

  throw new Error(`Unsupported ${assetType} asset format: missing both Nep141 and valid Nep245`)
}

function validateConfiguration(configuration) {
  if (!configuration || typeof configuration !== 'object') throw new Error('Configuration is not an object')
  if (!configuration.borrow_asset) throw new Error('Missing borrow_asset in configuration')
  if (!configuration.collateral_asset) throw new Error('Missing collateral_asset in configuration')
}

function coerceAndValidateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') throw new Error('Snapshot is not an object')

  const requiredFields = [
    'borrow_asset_deposited_active',
    'borrow_asset_deposited_incoming',
    'borrow_asset_borrowed',
    'collateral_asset_deposited',
  ]

  for (const field of requiredFields) {
    let v = snapshot[field]
    if (v === undefined || v === null) v = '0'
    if (typeof v === 'number') v = String(Math.trunc(v))
    if (typeof v !== 'string' || !/^\d+$/.test(v)) {
      throw new Error(`Invalid snapshot field ${field}: expected uint string, got ${JSON.stringify(snapshot[field])}`)
    }
    snapshot[field] = v
  }

  return snapshot
}

async function fetchAllDeployments(contracts) {
  const allDeployments = []
  const errors = []
  const successfulContracts = []

  const contractResults = await Promise.allSettled(
    contracts.map(async (contract) => {
      if (!contract || typeof contract !== 'string') {
        throw new Error(`Invalid contract address: ${contract}`)
      }
      const deployments = await fetchDeploymentsFromContract(contract)
      return { contract, deployments }
    })
  )

  for (const result of contractResults) {
    const index = contractResults.indexOf(result)
    const contract = contracts[index]

    if (result.status === 'fulfilled') {
      const { deployments } = result.value
      if (deployments.length > 0) {
        console.log(`Contract ${contract}: found ${deployments.length} deployments`)
        allDeployments.push(...deployments)
        successfulContracts.push(contract)
      } else {
        console.log(`Contract ${contract}: no deployments found`)
      }
    } else {
      const errorMsg = result.reason?.message || result.reason
      console.log(`Contract ${contract} failed: ${errorMsg}`)
      errors.push(`${contract}: ${errorMsg}`)
    }
  }

  const uniqueDeployments = [...new Set(allDeployments)]
  if (uniqueDeployments.length !== allDeployments.length) {
    console.log(`Removed ${allDeployments.length - uniqueDeployments.length} duplicate deployments`)
  }

  console.log(`Total deployments from ${successfulContracts.length} contracts: ${uniqueDeployments.length}`)

  if (successfulContracts.length > 0) {
    console.log(`Successfully fetched deployments from contracts: ${successfulContracts.join(', ')}`)
    return uniqueDeployments
  }

  throw new Error(`All contracts failed. Errors: ${errors.join('; ')}`)
}

async function fetchDeploymentsFromContract(registryContract) {
  const deployments = []
  let offset = 0
  const limit = 100
  let hasMore = true

  while (hasMore) {
    const batch = await safeCall(registryContract, 'list_deployments', { offset, count: limit })
    if (!batch || !Array.isArray(batch) || batch.length === 0) {
      hasMore = false
      break
    }
    deployments.push(...batch)
    hasMore = batch.length === limit
    offset += limit
  }

  return deployments
}

async function processMarket(marketContract) {
  const [snapshotRaw, configurationRaw] = await Promise.all([
    safeCall(marketContract, 'get_current_snapshot', {}),
    safeCall(marketContract, 'get_configuration', {}),
  ])

  const snapshot = coerceAndValidateSnapshot(snapshotRaw)
  const configuration = configurationRaw

  validateConfiguration(configuration)

  if (!configuration?.borrow_asset || !configuration?.collateral_asset) {
    throw new Error('Invalid configuration: missing borrow_asset or collateral_asset')
  }

  const borrowAssetToken = extractTokenAddress(configuration.borrow_asset, 'borrow')
  const collateralAssetToken = extractTokenAddress(configuration.collateral_asset, 'collateral')

  const borrow_asset_deposited_active = BigNumber(snapshot.borrow_asset_deposited_active)
  const borrow_asset_deposited_incoming = BigNumber(snapshot.borrow_asset_deposited_incoming)
  const collateral_asset_deposited = BigNumber(snapshot.collateral_asset_deposited)
  const borrow_asset_borrowed = BigNumber(snapshot.borrow_asset_borrowed)

  const availableLiquidity = borrow_asset_deposited_active
    .plus(borrow_asset_deposited_incoming)
    .minus(borrow_asset_borrowed)

  return {
    borrowAssetToken,
    collateralAssetToken,
    availableLiquidity,
    totalBorrowed: borrow_asset_borrowed,
    totalCollateral: collateral_asset_deposited,
  }
}

async function tvl() {
  const balances = {}

  const deployments = await fetchAllDeployments(TEMPLAR_REGISTRY_CONTRACTS)
  if (deployments.length === 0) {
    console.log('No Templar deployments found for TVL calculation')
    return balances
  }

  const results = await Promise.allSettled(deployments.map(processMarket))

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { borrowAssetToken, collateralAssetToken, availableLiquidity, totalCollateral } = result.value
      sumSingleBalance(balances, borrowAssetToken, availableLiquidity.toFixed())
      sumSingleBalance(balances, collateralAssetToken, totalCollateral.toFixed())
    } else {
      throw new Error(`Market ${deployments[index]} failed: ${result.reason?.message || result.reason}`)
    }
  })

  return balances
}

async function borrowed() {
  const balances = {}

  const deployments = await fetchAllDeployments(TEMPLAR_REGISTRY_CONTRACTS)
  if (deployments.length === 0) {
    console.log('No Templar deployments found for borrowed calculation')
    return balances
  }

  const results = await Promise.allSettled(deployments.map(processMarket))

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { borrowAssetToken, totalBorrowed } = result.value
      sumSingleBalance(balances, borrowAssetToken, totalBorrowed.toFixed())
    } else {
      throw new Error(`Market ${deployments[index]} failed: ${result.reason?.message || result.reason}`)
    }
  })

  return balances
}

module.exports = {
  methodology: 'TVL is calculated by summing the net borrow asset liquidity (deposits minus outstanding loans) and full collateral deposits for each market deployment.',
  start: 1754902109,
  near: { tvl, borrowed },
}
