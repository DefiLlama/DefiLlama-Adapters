const sdk = require("@defillama/sdk")
const { getBlock } = require("../helper/getBlock");
const {sumTokens, unwrapCrv} = require("../helper/unwrapLPs.js")
const {staking} = require("../helper/staking.js")
const abi = require("./abi.json");
const { sumMultiBalanceOf } = require("@defillama/sdk/build/generalUtil");

const spoolController = '0xdd4051c3571c143b989c3227e8eb50983974835c'
const masterSpool = '0xe140bb5f424a53e0687bfc10f6845a5672d7e242'

const SPOOL = '0x40803cea2b2a32bda1be61d3604af6a814e70976'
const SPOOL_staking = '0xc3160C5cc63B6116DD182faA8393d3AD9313e213'


const chain = 'ethereum'
// TVL is asset holdings of the masterSpool + all capital deployed via each strategy
async function tvl (timestamp, ethBlock, chainBlocks) {
    const balances = {}
    const block = await getBlock(timestamp, chain, chainBlocks) // 14501309 // 

    // Get strategies contract addresses and underlying tokens
    let {output: strategies} = await sdk.api.abi.call({
        abi: abi['spoolController_getAllStrategies'],
        target: spoolController,
        block,
        chain,
      })
    // strategies = ['0x854DB91E371e42818936E646361452c3060ec9dd']
    const {output: underlyings_nonunique} = await sdk.api.abi.multiCall({
        abi: abi['strategy_underlying'],
        calls:  strategies.map(s => ({target: s})),
        block,
        chain,
      })
    const underlyings = [... new Set(underlyings_nonunique.map(u => u.output))]; 
    // console.log('strategies', strategies, 'underlyings', underlyings)

    // Balances of tokens pending to be deployed in strategies
    const tokensAndOwners = underlyings.map(t => [t, masterSpool])
    await sumTokens(balances, tokensAndOwners, block, chain) 
    
    const underlyingBalances = await sdk.api.abi.multiCall({
      abi: abi['masterSpool_getStratUnderlying'],
      calls: strategies.map(strat => ({
        target: masterSpool,
        params: strat
      })),
      block,
      chain,
    })
    // console.log('underlyingBalances', underlyingBalances)
    // Since tvl is deployed to aave, yearn, compound, use masterSpool_getStratUnderlying method
    // For simplicity, trick sumMultiBalanceOf into thinking the calls were erc20 balanceOf 
    underlyingBalances.output.forEach((c, i) => c.input.target = underlyings_nonunique[i].output)
    await sumMultiBalanceOf(balances, underlyingBalances)

    // console.log(`balances `, balances) 
    return balances
}

module.exports = {
  ethereum: {
    tvl,
    staking: staking(SPOOL_staking, SPOOL, "ethereum"), 
  },
  methodology: `Counting Pending deposits in the MasterSpool contract as well as assets deployed to each strategy`
}
