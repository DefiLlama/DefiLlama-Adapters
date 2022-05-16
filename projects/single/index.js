const { sumTokens } = require("../helper/unwrapLPs")
const { getChainTransform, getFixBalances } = require("../helper/portedTokens")
const { getUserMasterChefBalances } = require("../helper/masterchef")
const { getUserCraftsmanV2Balances } = require("./helpers")
const { pools } = require("./cronos/pools")
const vvsPoolInfoABI = require('./cronos/vvsPoolInfo.json')
const { fetchURL } = require("../helper/utils")

const chain = 'cronos'
const VVS_WMASTERCHEF_ADDR = '0x05e0A288441dd6Ae69e412e4EB16f812498a4e32'
const VVS_MASTERCHEF = '0xDccd6455AE04b03d785F12196B492b18129564bc'
const MMF_MASTERCHEF = '0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc'
const MMF_WMASTERCHEF_ADDR = '0x539E14063fd3B5fC0C0ccf1E965397a284bC48cf'
const SINGLE_TOKEN = '0x0804702a4e749d39a35fde73d1df0b1f1d6b8347'

const API = 'https://api.singlefinance.io'

async function staking(timestamp, _block, chainBlocks) {
  let balances = {}
  const transformAddress = await getChainTransform(chain)
  const fixBalances = await getFixBalances(chain)
  const block = chainBlocks[chain]
  const tokenAndOwners= pools.filter(pool => !pool.isLP).map(pool => [pool.tokenContract, pool.address])
  await sumTokens(balances, tokenAndOwners, block, chain, transformAddress)
  fixBalances(balances)
  return balances
}

async function tvl(tx, _block, chainBlocks) {
  const balances = {}
  const block = chainBlocks[chain]
  const fixBalances = await getFixBalances(chain)
  const { data: { vaults, wmasterchefs } } = await fetchURL(`${BASE_API_URL}/api/protocol/contracts`)

  for (const { masterChef: masterChefAddress, wMasterChef, name, ...rest } of wmasterchefs) {
    if (name === "vvsMultiYield") {
      await getUserCraftsmanV2Balances({ balances, masterChefAddress, userAddres: wMasterChef, block, chain, poolInfoABI: vvsPoolInfoABI, excludePool2: true, pool2Tokens: [ SINGLE_TOKEN ], craftsmanV1: rest.craftsmanV1 })
      continue;
    }
    await getUserMasterChefBalances({ balances, masterChefAddress, userAddres: wMasterChef, block, chain, poolInfoABI: vvsPoolInfoABI, excludePool2: true, pool2Tokens: [ SINGLE_TOKEN ] })
  }

  const tokenAndOwners = vaults.map(({token, address}) => [token, address])
  await sumTokens(balances, tokenAndOwners, block, chain) // Add lending pool tokens to balances
  fixBalances(balances)
  return balances
}

async function pool2(tx, _block, chainBlocks) {
  const balances = {}
  const block = chainBlocks[chain]
  const fixBalances = await getFixBalances(chain)
  const tokenAndOwners = pools.filter(pool => pool.isLP).map(pool => [pool.tokenContract, pool.address])
  await sumTokens(balances, tokenAndOwners, block, chain, undefined, { resolveLP: true }) // Add staked lp tokens to balances
  const { data: { wmasterchefs } } = await fetchURL(`${BASE_API_URL}/api/protocol/contracts`)

  for (const { masterChef: masterChefAddress, wMasterChef, name, ...rest } of wmasterchefs) {
    if (name === "vvsMultiYield") {
      await getUserCraftsmanV2Balances({ balances, masterChefAddress, userAddres: wMasterChef, block, chain, poolInfoABI: vvsPoolInfoABI, onlyPool2: true, pool2Tokens: [ SINGLE_TOKEN ], craftsmanV1: rest.craftsmanV1 })
      continue;
    }
    await getUserMasterChefBalances({ balances, masterChefAddress, userAddres: wMasterChef, block, chain, poolInfoABI: vvsPoolInfoABI, onlyPool2: true, pool2Tokens: [ SINGLE_TOKEN ] })
  }

  fixBalances(balances)
  return balances
}

module.exports = {
  start: 1643186078,
  // if we can backfill data with your adapter. Most SDK adapters will allow this, but not all. For example, if you fetch a list of live contracts from an API before querying data on-chain, timetravel should be 'false'.
  timetravel: true,
  //if you have used token substitutions at any point in the adapter this should be 'true'.
  misrepresentedTokens: true,
  cronos: {
    tvl, pool2, staking,
  },
} // see if single will run with updated unwrapLPs


