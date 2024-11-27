const { sumTokens2 } = require("../helper/unwrapLPs")
const { getUserMasterChefBalances } = require("../helper/masterchef")
const { getUserCraftsmanV2Balances, getUserCamelotMasterBalances } = require("./helpers")
const vvsPoolInfoABI = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accVVSPerShare)'
const spookyMasterChefV2PoolInfoABI = 'function lpToken(uint256) view returns (address)'
const { getConfig } = require('../helper/cache')

const sdk = require('@defillama/sdk')

const BASE_API_URL = 'https://api.singlefinance.io'

const constants = {
  'cronos': {
    chainId: 25,
    single: '0x0804702a4e749d39a35fde73d1df0b1f1d6b8347'
  },
  'fantom': {
    chainId: 250,
    single: '0x8cc97b50fe87f31770bcdcd6bc8603bc1558380b'
  },
  'arbitrum': {
    chainId: 42161,
    single: '0x55853edc67aa68ec2e3903ac00f2bc5bf2ca8db0'
  }
}

const getWMasterChefBalances = ({ masterChef: masterChefAddress, wMasterChef, name, ...rest }, args) => {
  const commonParams = { masterChefAddress, userAddres: wMasterChef }
  if (name === "vvsMultiYield") {
    return getUserCraftsmanV2Balances({ ...commonParams, poolInfoABI: vvsPoolInfoABI, craftsmanV1: rest.craftsmanV1, ...args })
  }
  if (name === "spookyMultiYield" || name === "sushi") {
    return getUserMasterChefBalances({ ...commonParams, poolInfoABI: spookyMasterChefV2PoolInfoABI, getLPAddress: a => a, ...args })
  }
  if (name === "camelot") {
    return getUserCamelotMasterBalances({ ...commonParams, ...args })
  }
  return getUserMasterChefBalances({ ...commonParams, poolInfoABI: vvsPoolInfoABI, ...args })
}
const data = {

}
const getHelpers = (chain) => {

  const SINGLE_TOKEN = constants[chain].single;

  const fetchDataOnce = (() => {
    if (!data[chain]) return getConfig('single/contracts/'+chain, `${BASE_API_URL}/api/protocol/contracts?chainid=${constants[chain].chainId}`)
    return data[chain]
  })

  async function staking(timestamp, _block, chainBlocks) {

    const  { pools, }  = await fetchDataOnce()

    let balances = {}
    const block = chainBlocks[chain]
    const tokensAndOwners = pools.filter(pool => !pool.isLP).map(pool => [pool.tokenContract, pool.address])

    await sumTokens2({ balances, tokensAndOwners, block, chain })
    return balances
  }

  async function tvl(tx, _block, chainBlocks) {

    const  { wmasterchefs, vaults, }  = await fetchDataOnce()

    const balances = {}
    const block = chainBlocks[chain]

    for (const wMasterChef of wmasterchefs) {
      await getWMasterChefBalances(wMasterChef, { balances, block, chain, excludePool2: true, pool2Tokens: [SINGLE_TOKEN] })
    }

    const tokensAndOwners = vaults.map(({ token, address }) => [token, address])
    await sumTokens2({ balances, tokensAndOwners, block, chain }) // Add lending pool tokens to balances
    return balances
  }

  async function pool2(tx, _block, chainBlocks) {

    const {  wmasterchefs, pools } = await fetchDataOnce()

    const balances = {}
    const block = chainBlocks[chain]
    const tokensAndOwners = pools.filter(pool => pool.isLP).map(pool => [pool.tokenContract, pool.address])
    await sumTokens2({ balances, tokensAndOwners, block, chain, resolveLP: true }) // Add staked lp tokens to balances

    for (const wMasterChef of wmasterchefs) {
      await getWMasterChefBalances(wMasterChef, { balances, block, chain, onlyPool2: true, pool2Tokens: [SINGLE_TOKEN] })
    }

    return balances
  }

  return {
    tvl,
    pool2,
    staking
  }
}

module.exports = {
  start: '2022-01-26',
  // if we can backfill data with your adapter. Most SDK adapters will allow this, but not all. For example, if you fetch a list of live contracts from an API before querying data on-chain, timetravel should be 'false'.
  //if you have used token substitutions at any point in the adapter this should be 'true'.
  misrepresentedTokens: true,
  // cronos: getHelpers('cronos'),
  cronos: {
    tvl: cronosTvl,
  },
  fantom: getHelpers('fantom'),
  arbitrum: getHelpers('arbitrum'),
} // see if single will run with updated unwrapLPs


async function cronosTvl(_, _b, { cronos: block }) {
  const { data } = await getConfig('single/vault/cronos', 'https://api.singlefinance.io/api/vaults?chainid=25')
  const { data: strategies } = await getConfig('single/strategy/cronos','https://api.singlefinance.io/api/strategies?chainid=25')
  const tether = strategies.reduce((a, i)=> a+i.tvl/1e18, 0)
  const balances = {}
  data.forEach(({ token: { id }, totalTokens }) => sdk.util.sumSingleBalance(balances, 'cronos:' + id, totalTokens))
  sdk.util.sumSingleBalance(balances, 'tether', tether)
  return balances
}
