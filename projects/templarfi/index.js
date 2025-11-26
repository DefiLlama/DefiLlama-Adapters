const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance } = require('../helper/chain/near')

const TEMPLAR_REGISTRY_CONTRACTS = [
  'v1.tmplr.near',
]

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000
const CALL_TIMEOUT_MS = 30000

const sleep = (ms) =>  new Promise(resolve => setTimeout(resolve, ms))

function detectCrossChainToken(tokenId) {
  if (tokenId.includes('v2_1.omni.hot.tg:1100_')) {
    const stellarMappings = {
      '111bzQBB5v7AhLyPMDwS8uJgQV24KaAPXtwyVWu2KXbbfQU6NXRCz': 'coingecko:stellar',
      '111bzQBB65GxAPAVoxqmMcgYo5oS3txhqs1Uh1cgahKQUeTUq1TJu': 'coingecko:usd-coin',
    }
    const match = tokenId.match(/1100_([a-zA-Z0-9]+)$/)
    if (match && stellarMappings[match[1]]) {
      return stellarMappings[match[1]]
    }
  }
  
  if (tokenId === 'btc.omft.near') return 'coingecko:bitcoin'
  if (tokenId.match(/^eth-0x([a-fA-F0-9]{40})\.omft\.near$/)) {
    const match = tokenId.match(/^eth-0x([a-fA-F0-9]{40})\.omft\.near$/)
    return `ethereum:0x${match[1].toLowerCase()}`
  }
  
  return tokenId
}

async function withRetry(fn, maxAttempts = MAX_RETRY_ATTEMPTS, delayMs = RETRY_DELAY_MS) {
  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (error.message && error.message.includes('does not exist')) {
        throw error
      }
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
    return detectCrossChainToken(assetConfig.Nep141)
  }

  if (assetConfig.Nep245?.token_id) {
    const tokenId = assetConfig.Nep245.token_id
    if (typeof tokenId !== 'string' || tokenId.length === 0) {
      throw new Error(`Invalid NEP-245 token ID for ${assetType} asset`)
    }
    
    const crossChainResult = detectCrossChainToken(tokenId)
    if (crossChainResult !== tokenId) {
      return crossChainResult
    }
    
    const parts = tokenId.split(':')
    if (parts.length >= 2 && parts[0] === 'nep141') {
      if (parts[1].length === 0) {
        throw new Error(`Empty NEP-141 address in NEP-245 token for ${assetType} asset`)
      }
      return detectCrossChainToken(parts[1])
    }
    
    return tokenId
  }

  throw new Error(`Unsupported ${assetType} asset format: missing both Nep141 and valid Nep245`)
}

function validateConfiguration(configuration) {
  if (!configuration || typeof configuration !== 'object') throw new Error('Configuration is not an object')
  if (!configuration.borrow_asset) throw new Error('Missing borrow_asset in configuration')
  if (!configuration.collateral_asset) throw new Error('Missing collateral_asset in configuration')
}

function scaleTokenAmount(amount, tokenAddress, decimals) {
  if (tokenAddress.startsWith('coingecko')) {
    return amount.div(Math.pow(10, decimals)).toFixed();
  }
  
  return amount.toFixed()
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
  try {
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

  const borrowDecimals = configuration.price_oracle_configuration.borrow_asset_decimals
  const collateralDecimals = configuration.price_oracle_configuration.collateral_asset_decimals

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
      borrowDecimals,
      collateralDecimals,
    }
  } catch (error) {
    if (error.message && error.message.includes('does not exist')) {
      console.log(`Market ${marketContract} has been deleted, skipping...`)
      return null
    }
    throw error
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
      if (result.value === null) {
        return
      }
      const { borrowAssetToken, collateralAssetToken, availableLiquidity, totalCollateral, borrowDecimals, collateralDecimals } = result.value
      sumSingleBalance(balances, borrowAssetToken, scaleTokenAmount(availableLiquidity, borrowAssetToken, borrowDecimals))
      sumSingleBalance(balances, collateralAssetToken, scaleTokenAmount(totalCollateral, collateralAssetToken, collateralDecimals))
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
      if (result.value === null) {
        return
      }
      const { borrowAssetToken, totalBorrowed, borrowDecimals } = result.value
      sumSingleBalance(balances, borrowAssetToken, scaleTokenAmount(totalBorrowed, borrowAssetToken, borrowDecimals))
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
