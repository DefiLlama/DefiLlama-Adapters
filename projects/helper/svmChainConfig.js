/** I created this file to get around circular dependency issues */

require("./env") // seeds process.env with the adapter defaults before the sdk reads <CHAIN>_RPC
const { chains } = require('@defillama/sdk')

const endpoint = (isClient) => chains.svm.getEndpoint({ chain: 'solana', isClient: !!isClient })

const endpointMap = {}
chains.svm.svmChains.forEach(chain => {
  endpointMap[chain] = (isClient) => chains.svm.getEndpoint({ chain, isClient: !!isClient })
})
const svmChains = Object.keys(endpointMap)

module.exports = {
  endpoint,
  endpointMap,
  svmChains,
  svmChainsSet: new Set(svmChains),
}
