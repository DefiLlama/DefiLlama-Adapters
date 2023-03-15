// https://www.starknetjs.com/docs/API/contract
const { Provider, Contract, validateAndParseAddress } = require('starknet')
const { PromisePool } = require('@supercharge/promise-pool')

let provider

function getProvider() {
  if (!provider)
    provider = new Provider({
      sequencer: {
        network: 'mainnet-alpha'
      }
    })
  return provider
}

async function call({ abi, target, params = [], allAbi = [] }) {
  if ((params || params === 0) && !Array.isArray(params))
    params = [params]
  const contract = new Contract([abi, ...allAbi, ], target, getProvider())
  const response = await contract[abi.name](...params)
  if (abi.outputs.length === 1) return response[0]
  return response
}

async function multiCall({ abi: rootAbi, target: rootTarget, calls = [],  allAbi = [] }) {
  calls = calls.map((callArgs) => {
    if (typeof callArgs !== 'object') {
      if (!rootTarget)  return { target: callArgs, abi: rootAbi, allAbi, }
      return { target: rootTarget, params: callArgs, abi: rootAbi, allAbi, }
    }
    const { target, params, abi } = callArgs
    return { target: target || rootTarget, params, abi: abi || rootAbi }
  })
  
  const { results, errors } = await PromisePool.withConcurrency(7)
    .for(calls)
    .process(async (args, i) => ([i, await call(args)]))

  if (errors && errors.length)
    throw errors[0]

  results.sort(([a], [b]) => a -b)  // workaround for Promise Pool fucking up the order
  return results.map(i => i[1])
}

module.exports = {
  getProvider,
  call,
  multiCall,
  parseAddress: validateAndParseAddress,
}