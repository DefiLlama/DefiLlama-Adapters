const { sumTokens2 } = require("../helper/unwrapLPs")
const { getUserMasterChefBalances } = require("../helper/masterchef")
const { getUserCraftsmanV2Balances, getUserCamelotMasterBalances } = require("./helpers")
const vvsPoolInfoABI = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accVVSPerShare)'
const spookyMasterChefV2PoolInfoABI = 'function lpToken(uint256) view returns (address)'
const { getConfig } = require('../helper/cache')

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
    return getUserMasterChefBalances({ ...commonParams, poolInfoABI: spookyMasterChefV2PoolInfoABI, getLPAddress: a => a, ...args,  chain: args.api.chain, block: args.api.block, balances: args.api.getBalances()  })
  }
  if (name === "camelot") {
    return getUserCamelotMasterBalances({ ...commonParams, ...args })
  }
  return getUserMasterChefBalances({ ...commonParams, poolInfoABI: vvsPoolInfoABI, ...args, chain: args.api.chain, block: args.api.block, balances: args.api.getBalances() })
}

const getHelpers = (chain) => {

  const SINGLE_TOKEN = constants[chain].single;

  const _getConfig = () => getConfig('single/contracts/'+chain, `${BASE_API_URL}/api/protocol/contracts?chainid=${constants[chain].chainId}`)

  async function staking(api) {

    const  { pools, }  = await _getConfig()
    const tokensAndOwners = pools.filter(pool => !pool.isLP).map(pool => [pool.tokenContract, pool.address])

    return sumTokens2({ tokensAndOwners, api })
  }

  async function tvl(api) {
    const  { wmasterchefs, vaults, }  = await _getConfig()
    for (const wMasterChef of wmasterchefs) {
      await getWMasterChefBalances(wMasterChef, { api, excludePool2: true, pool2Tokens: [SINGLE_TOKEN] })
    }

    const tokensAndOwners = vaults.map(({ token, address }) => [token, address])
    await sumTokens2({ api, tokensAndOwners, }) // Add lending pool tokens to balances
  }

  async function pool2(api) {
    const {  wmasterchefs, pools } = await _getConfig()
    const tokensAndOwners = pools.filter(pool => pool.isLP).map(pool => [pool.tokenContract, pool.address])
    await sumTokens2({ api, tokensAndOwners, resolveLP: true }) // Add staked lp tokens to balances

    for (const wMasterChef of wmasterchefs) {
      await getWMasterChefBalances(wMasterChef, { api, onlyPool2: true, pool2Tokens: [SINGLE_TOKEN] })
    }
  }

  return {
    tvl,
    pool2,
    staking
  }
}

module.exports = {
  start: '2022-01-26',
  misrepresentedTokens: true,
  cronos: getHelpers('cronos'),
  fantom: getHelpers('fantom'),
  arbitrum: getHelpers('arbitrum'),
}


/* async function cronosTvl(api) {
  const { data } = await getConfig('single/vault/cronos', 'https://api.singlefinance.io/api/vaults?chainid=25')
  const tokensAndOwners = data.map(({ token, address }) => [token.id, address])
  await api.sumTokens({ tokensAndOwners})
  const { data: strategies } = await getConfig('single/strategy/cronos','https://api.singlefinance.io/api/strategies?chainid=25')
  const tether = strategies.reduce((a, i)=> a+i.tvl/1e18, 0)
  api.addUSDValue(tether)
}
 */