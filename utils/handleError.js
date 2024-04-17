const errorString = '------ ERROR ------'

function handleError(error){
  console.log('\n',errorString, '\n\n')
  const isGraphError = error.stack?.includes('graphql-request') && error.response?.errors?.length
  if (isGraphError)
    console.error(error.response.errors.map(e => e.message).join('\n'))
  else
    console.error(error.toString())
  const axiosError  = error?.response?.data?.message
  if (axiosError)
    console.log('Axios: ', axiosError)
  const stack = getStackMessage(error.stack)
  if (stack.length) {
    console.log('Truncated error stack:')
    console.log(stack.join('\n'))
  }
  process.exit(1)
}

function getStackMessage(stack) {
  if (!stack) return []
  if (/ at (checkExportKeys)/.test(stack)) return []

  const isNodeMolule = m => /node_modules/.test(m)
  const isNotLoggerMessage = m => !/log/.test(m)
  const isNotInternalMessage = m => !/node:internal/.test(m)

  const message = []
  stack = stack.split('\n')
  while (stack.length && !stack[0].includes('  at '))
    stack.shift()
  const firstNMStackMessage = stack.filter(isNodeMolule)
    .filter(isNotLoggerMessage)[0]
  stack = stack.filter(m => !isNodeMolule(m)).filter(isNotInternalMessage)
  message.push(firstNMStackMessage, ...stack)
  return message
}

module.exports = handleError