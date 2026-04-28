/**
 * Phoenix Protocol — Soroban (Stellar) TVL adapter
 *
 * Phoenix is a concentrated-liquidity AMM DEX on Soroban. The factory contract
 * tracks all deployed pool addresses; each pool holds two reserve assets.
 *
 * Data flow:
 *   factory.query_pools()           → Vec<Address>  (one call, always fresh)
 *   stellar.expert /contract/{p}/value → USD value per pool
 *
 * Phoenix factory (mainnet): CB4SVAWJA6TSRNOJZ7W2AWFW46D5VR4ZMFZKDIKXEINZCZEGZCJZCKMI
 * Source: https://github.com/Phoenix-Protocol-Group/phoenix-contracts
 */

'use strict'

const { sorobanFactoryTvl } = require('../helper/chain/sorobanFactory')
const methodologies = require('../helper/methodologies')

const PHOENIX_FACTORY = 'CB4SVAWJA6TSRNOJZ7W2AWFW46D5VR4ZMFZKDIKXEINZCZEGZCJZCKMI'

/**
 * @param {object} api - DeFiLlama adapter API
 */
async function tvl(api) {
  await sorobanFactoryTvl(api, PHOENIX_FACTORY, { style: 'vec', queryFn: 'query_pools' })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `${methodologies.dexTVL}. Pool list is enumerated live from the Phoenix factory contract on Soroban via callSoroban(query_pools). Each pool's USD value is sourced from stellar.expert contract balance API.`,
  stellar: { tvl },
}
