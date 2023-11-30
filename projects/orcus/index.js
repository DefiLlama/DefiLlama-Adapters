const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/unwrapLPs')
const { getTokenPrices } = require('../helper/unknownTokens')
const { getFixBalances } = require('../helper/portedTokens')
const { createIncrementArray } = require('../helper/utils')
const masterChefABI = require('../helper/abis/masterchef.json')
const abi = require('./abi')
const sdk = require('@defillama/sdk')

const chain = 'astar'
const MASTER_CHEF = '0xfa1Cfa75bFae8303A9Fe8aF711AacD59015eE6d4'
const USDC = ADDRESSES.moonbeam.USDC
const ibUSDC = ADDRESSES.astar.lUSDC
const ORU = '0xCdB32eEd99AA19D39e5d6EC45ba74dC4afeC549F'
const STAKE_ADDRESS = '0x243e038685209B9B68e0521bD5838C6C937d666A'
const BANK_SAFE = '0xd89dEa2daC8Fb73F4107C2cbeA5Eb36dab511F64'

let balanceResolve;

async function getTVL(chainBlocks) {
  const balances = {}
  const pool2Balances = {}
  const stakeBalances = {}
  const fixBalances = await getFixBalances(chain)
  const block = chainBlocks[chain]

  // resolve masterchef
  const poolLength = (await sdk.api.abi.call({ abi: masterChefABI.poolLength, target: MASTER_CHEF, block, chain, })).output
  let pools = (await sdk.api.abi.multiCall({ target: MASTER_CHEF, abi: abi.lpToken, block, chain, calls: createIncrementArray(poolLength).map(i => ({ params: [i] })) })).output.map(p => p.output.toLowerCase())
  const tokensAndOwners = pools.map(p => [p, MASTER_CHEF])
  await sumTokens(pool2Balances, tokensAndOwners, block, chain)
  const {
    updateBalances
  } = await getTokenPrices({ block, chain, lps: pools, 
    useDefaultCoreAssets: true, })
  await updateBalances(pool2Balances)
  await fixBalances(pool2Balances)


  // resolve pool2
  await sumTokens(stakeBalances, [[ORU, STAKE_ADDRESS]], block, chain)
  await updateBalances(stakeBalances)
  await fixBalances(stakeBalances)


  // resolve bank
  await sumTokens(balances, [[USDC, BANK_SAFE], [ibUSDC, BANK_SAFE]], block, chain)
  await updateBalances(balances)
  await fixBalances(balances)

  return {
    tvl: balances,
    pool2: pool2Balances,
    staking: stakeBalances,
  }
}


async function tvl(ts, _block, chainBlocks) {
  if (!balanceResolve)  balanceResolve = getTVL(chainBlocks)
  return (await balanceResolve).tvl
}

async function pool2(ts, _block, chainBlocks) {
  if (!balanceResolve)  balanceResolve = getTVL(chainBlocks)
  return (await balanceResolve).pool2
}

async function staking(ts, _block, chainBlocks) {
  if (!balanceResolve)  balanceResolve = getTVL(chainBlocks)
  return (await balanceResolve).staking
}

module.exports = {
  astar: {
    tvl,
    staking,
    pool2,
  }
}