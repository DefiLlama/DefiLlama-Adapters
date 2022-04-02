const sdk = require("@defillama/sdk")
const { getBlock } = require("../helper/getBlock");
const {sumTokens, unwrapCrv} = require("../helper/unwrapLPs.js")
const {staking} = require("../helper/staking.js")
const abi = require("./abi.json")

const spoolController = '0xe5b126ae9540809488990a9813e1a2732f678047'
const masterSpool = '0x534ef1c63cc191076ea8252f25bbd29d9db6e635'

const SPOOL = '0x40803cea2b2a32bda1be61d3604af6a814e70976'
const SPOOL_staking = '0xc3160C5cc63B6116DD182faA8393d3AD9313e213'


const chain = 'ethereum'
// TVL is asset holdings of the masterSpool + all capital deployed via each strategy
async function tvl (timestamp, ethBlock, chainBlocks) {
    const balances = {}
    const block = await getBlock(timestamp, chain, chainBlocks)

    // Get strategies contract addresses and underlying tokens
    const {output: strategies} = await sdk.api.abi.call({
        abi: abi['spoolController_getAllStrategies'],
        target: spoolController,
        block,
        chain,
      })
    const {output: underlyings_nonunique} = await sdk.api.abi.multiCall({
        abi: abi['strategy_underlying'],
        calls:  strategies.map(s => ({target: s})),
        block,
        chain,
      })
    const underlyings = [... new Set(underlyings_nonunique.map(u => u.output))]; 
    console.log(underlyings)

    // Balances of tokens pending to be deployed in strategies
    const tokensAndOwners = underlyings.map(t => [t, masterSpool])
    await sumTokens(balances, tokensAndOwners, block, chain) 
    
    const {output: underlyingBalances} = await sdk.api.abi.multiCall({
      abi: abi['masterSpool_getUnderlying'],
      calls: strategies.map(strat => ({
        target: masterSpool,
        params: strat
      })),
      block,
      chain,
    })
    console.log('underlyingBalances', underlyingBalances)

    console.log(`balances `, balances) 
    return balances
}

module.exports = {
  ethereum: {
    tvl,
    staking: staking(SPOOL_staking, SPOOL, "ethereum"), 
  },
  methodology: `Counting Pending deposits in the MasterSpool contract as well as assets deployed to each strategy`
}
