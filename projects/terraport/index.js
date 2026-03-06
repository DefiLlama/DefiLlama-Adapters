const { queryContract, queryContractWithRetries } = require('../helper/chain/cosmos');
const { PromisePool } = require('@supercharge/promise-pool');

const TERRA_TOKEN = 'terra1ex0hjv3wurhj4wgup4jzlzaqj4av6xqd8le4etml7rg9rs207y4s8cdvrp';
const FACTORY_CONTRACT = 'terra1n75fgfc8clsssrm2k0fswgtzsvstdaah7la6sfu96szdu22xta0q57rqqr';
const CLASSIC_STAKING = 'terra134ummlrj2rnv8h8rjhs6a54fng0xlg8wk7a2gwu6vj42pznkf6xs95966d';
const DYNAMIC_STAKING = 'terra1x44ptyv7zp9e289jxqu6x5asxazhjc8gvuj9ltfs6mzvjfuzn8lqluk4u7';
const VESTING_CONTRACT = 'terra19v3vkpxsxeach4tpdklxaxc9wuwx65jqfs6jzm5cu5yz457hhgmsp4a48n';

async function terraBalance(contract, address) {
  const { balance } = await queryContract({ contract, chain: 'terra', data: { balance: { address } } })
  return balance
}

async function getAllPairs() {
  let allPairs = []
  let currentPairs
  do {
    const query = { pairs: { limit: 30 } }
    if (allPairs.length) query.pairs.start_after = allPairs[allPairs.length - 1].asset_infos
    currentPairs = (await queryContract({ contract: FACTORY_CONTRACT, chain: 'terra', data: query })).pairs ?? []
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  return allPairs
}

async function tvl(api) {
  const pairs = await getAllPairs()
  const poolContracts = pairs.map(p => p.contract_addr).filter(Boolean)

  const { errors } = await PromisePool
    .withConcurrency(10)
    .for(poolContracts)
    .process(async (pool) => {
      const result = await queryContractWithRetries({ contract: pool, chain: 'terra', data: { pool: {} } })
      for (const asset of result?.assets ?? []) {
        const { info, amount } = asset
        if (info.native_token) {
          api.add(info.native_token.denom, amount)
        } else if (info.token) {
          api.add(info.token.contract_addr, amount)
        }
      }
    })
  if (errors.length > poolContracts.length / 2) throw new Error(`Too many pool query failures: ${errors.length}/${poolContracts.length}`)
}

async function staking(api) {
  const classicBal = await terraBalance(TERRA_TOKEN, CLASSIC_STAKING)
  const dynamicBal = await terraBalance(TERRA_TOKEN, DYNAMIC_STAKING)
  api.add(TERRA_TOKEN, classicBal)
  api.add(TERRA_TOKEN, dynamicBal)
}

async function vesting(api) {
  const balance = await terraBalance(TERRA_TOKEN, VESTING_CONTRACT)
  api.add(TERRA_TOKEN, balance)
}

module.exports = {
  methodology: 'TVL is calculated by summing the value of assets in all Terraport liquidity pools fetched from the factory contract.',
  timetravel: false,
  terra: { tvl, staking, vesting },
}