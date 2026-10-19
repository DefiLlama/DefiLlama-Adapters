const ADDRESSES = require('../helper/coreAssets.json')
const { getEnv } = require('../helper/env')
const { post } = require('../helper/http')

// STRXProxy: mints sTRX and custodies the staked TRX
const STRX_PROXY = 'TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5'

const STAKED_RESOURCES = [undefined, 'BANDWIDTH', 'ENERGY']

// TRON_WALLET_RPC is a comma separated list of wallet API hosts (TRON_RPC holds the EVM json-rpc endpoints)
async function getAccount(address) {
  const hosts = getEnv('TRON_WALLET_RPC').split(',')
  for (const [i, host] of hosts.entries()) {
    try {
      return await post(`${host}/wallet/getaccount`, { address, visible: true })
    } catch (e) {
      if (i === hosts.length - 1) throw e
    }
  }
}

async function tvl(api) {
  const account = await getAccount(STRX_PROXY)
  const { frozenV2 = [], unfrozenV2 = [], account_resource: resource = {} } = account

  const amounts = [
    account.balance, // not yet staked
    ...frozenV2.filter(({ type }) => STAKED_RESOURCES.includes(type)).map(i => i.amount),
    account.delegated_frozenV2_balance_for_bandwidth, // staked here, resource lent out
    resource.delegated_frozenV2_balance_for_energy,
    ...unfrozenV2.map(i => i.unfreeze_amount), // in the 14 day unstaking window
  ]

  const total = amounts.reduce((sum, amount) => sum + BigInt(amount ?? 0), 0n)
  api.add(ADDRESSES.null, total.toString())
}

module.exports = {
  methodology: 'Counts the TRX custodied by JustLend DAO\'s Staked TRX contract (STRXProxy), which mints sTRX against deposits and stakes them for bandwidth and energy. Reads the Tron account state of the contract: its liquid balance, its frozenV2 BANDWIDTH and ENERGY stakes, the stake whose resources are delegated out to energy renters, and deposits sitting in the 14 day unstaking window. Resources delegated in from third parties are excluded, since that TRX is not owned by the contract. TRX supplied to the JustLend lending markets is not counted here, it is reported by JustLend V1.',
  start: '2023-04-14',
  timetravel: false,
  tron: { tvl },
}
