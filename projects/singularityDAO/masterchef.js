const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { sumTokens, } = require('../helper/unwrapLPs')

async function addFundsInMasterChef({ balances, block, masterchef, skipTokens = [] }) {
  const poolLength = (await sdk.api.abi.call({ target: masterchef, abi: abi.poolLength, block, })).output
  const calls = Array.from(Array(+poolLength).keys()).map(i => ({ params: i }))
  const response = (await sdk.api.abi.multiCall({ target: masterchef, calls, abi: abi.lpToken, block, })).output
  const tokensAndOwners = response.map(r => [r.output, masterchef ]).filter(([token]) => !skipTokens.includes(token))
  return sumTokens(balances, tokensAndOwners, block, undefined,undefined,{ resolveLP: true })
}


module.exports = {
  addFundsInMasterChef,
}
