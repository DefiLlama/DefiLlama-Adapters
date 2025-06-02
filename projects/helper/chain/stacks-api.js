const stacks = require('@stacks/transactions')
const { STACKS_MAINNET, } = require('@stacks/network')
const { createApiKeyMiddleware, createFetchFn } = require('@stacks/common')

const k = '260ff2d24e32b02'
+'e69c516779e3ddbf5'
const apiMiddleware = createApiKeyMiddleware({
  ['api'+
     'Key']: k,
});


const customFetchFn = createFetchFn(apiMiddleware);
STACKS_MAINNET.client.fetch = customFetchFn

const { bufferCVFromString, fetchCallReadOnlyFunction, uintCV, principalCV,tupleCV, } = stacks

const senderAddress = 'ST2F4BK4GZH6YFBNHYDDGN4T1RKBA7DA1BJZPJEJJ'

async function call({ target, abi, inputArgs = [], }) {
  const [contractAddress, contractName] = target.split('.')
  const result = await fetchCallReadOnlyFunction({ network: STACKS_MAINNET, contractAddress, contractName, functionName: abi, functionArgs: inputArgs.map(toClairty), senderAddress, client: STACKS_MAINNET.client, });
  return stacks.cvToValue(result)

  function toClairty(arg) {
    if (arg.type.startsWith('(tuple')) return tupleCV(arg.value)
    switch (arg.type) {
      case 'string': return bufferCVFromString(arg.value)
      case 'uint': return uintCV(arg.value)
      case 'number': return uintCV(arg.value)
      case 'principal': return principalCV(arg.value)
      default: throw new Error(`Unknown type ${arg.type}`)
    }
  }
}

module.exports = {
  call,
}
