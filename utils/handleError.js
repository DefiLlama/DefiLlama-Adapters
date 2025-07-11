const errorString = '------ ERROR ------'

function handleError(error, options = {}) {
  const { 
    shouldExit = false, 
    context = {}, 
    logger = console,
    errorLevel = 'error' 
  } = options

  logger.log('\n', errorString, '\n')
  
  // Enhanced error classification
  const errorInfo = classifyError(error, context)
  
  // Structured logging
  const logData = {
    timestamp: new Date().toISOString(),
    errorType: errorInfo.type,
    chain: error?.chain || context.chain || 'Unknown',
    protocol: context.protocol,
    adapter: context.adapter,
    ...errorInfo.details
  }

  // Log based on error type
  if (errorInfo.type === 'GRAPHQL_ERROR') {
    logger.error(`GraphQL Error on chain ${logData.chain}:`)
    error.response.errors.forEach(e => logger.error(`  - ${e.message}`))
  } else if (errorInfo.type === 'AXIOS_ERROR') {
    logger.error(`HTTP Error: ${error.response?.data?.message || error.message}`)
  } else {
    // Handle null/undefined errors safely
    const errorMessage = error ? error.toString() : 'No error provided (null/undefined)'
    logger.error(errorMessage)
  }

  // Enhanced stack trace
  const stack = getEnhancedStackMessage(error?.stack, context)
  if (stack.length) {
    logger.log('Relevant stack trace:')
    stack.forEach(line => logger.log(`  ${line}`))
  }

  // Return error info instead of always exiting
  if (shouldExit) {
    process.exit(1)
  }
  
  return errorInfo
}

function classifyError(error, context) {
  // Handle null or undefined errors
  if (!error) {
    return {
      type: 'UNKNOWN_ERROR',
      recoverable: false,
      details: { message: 'No error provided' }
    }
  }
  
  const isGraphError = error.stack?.includes('graphql-request') && error.response?.errors?.length
  const isAxiosError = error?.response?.data?.message
  const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
  
  if (isGraphError) {
    return {
      type: 'GRAPHQL_ERROR',
      recoverable: true,
      details: { errors: error.response.errors.map(e => e.message) }
    }
  }
  
  if (isAxiosError) {
    return {
      type: 'AXIOS_ERROR',
      recoverable: error.response?.status < 500,
      details: { 
        status: error.response?.status,
        message: error.response.data.message 
      }
    }
  }
  
  if (isTimeoutError) {
    return {
      type: 'TIMEOUT_ERROR',
      recoverable: true,
      details: { timeout: true }
    }
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    recoverable: false,
    details: { message: error.message }
  }
}

function getEnhancedStackMessage(stack, context = {}) {
  if (!stack) return []
  
  // Skip if it's a known validation error
  if (/ at (checkExportKeys)/.test(stack)) return []

  const isNodeModule = m => /node_modules/.test(m) && !/defillama/.test(m)
  const isRelevant = m => !(/log/.test(m) || /node:internal/.test(m))
  
  let lines = stack.split('\n')
  
  // Remove error message lines
  while (lines.length && !lines[0].includes('  at '))
    lines.shift()
  
  // Get relevant application stack
  const appStack = lines.filter(m => !isNodeModule(m)).filter(isRelevant)
  
  // Get first relevant node_modules line for context
  const firstNodeModuleLine = lines.filter(isNodeModule).filter(isRelevant)[0]
  
  const result = [...appStack]
  if (firstNodeModuleLine && context.includeNodeModules !== false) {
    result.push(`  ... ${firstNodeModuleLine}`)
  }
  
  return result.slice(0, 10) // Limit stack depth
}

module.exports = { handleError, classifyError }