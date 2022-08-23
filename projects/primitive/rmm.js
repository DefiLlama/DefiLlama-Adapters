const sdk = require('@defillama/sdk')
const {sumTokens} = require("../helper/unwrapLPs");
const abi = require("./abi.json");

const engine_weth_usdc = '0xd3541aD19C9523c268eDe8792310867C57BE39e4' // WETH-USDC Pair
const engines = [engine_weth_usdc]

module.exports = async function tvl(time, ethBlock, chainBlocks) {
  const [{output: risky}, {output: stable}] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: abi['risky'],
      calls: engines.map(e => ({target: e})),
      block: ethBlock,
    }), 
    sdk.api.abi.multiCall({
      abi: abi['stable'],
      calls: engines.map(e => ({target: e})),
      block: ethBlock,
    })
  ])
    
  const tokensAndOwners = risky.map((call, idx) => [
    [call.output, call.input.target],
    [stable[idx].output, call.input.target]
  ]).flat()
  const balances = {}
  await sumTokens(balances, tokensAndOwners, ethBlock, 'ethereum')
  return balances
}