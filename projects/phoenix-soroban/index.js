/**
 * Phoenix Protocol — Soroban (Stellar) TVL adapter
 */

'use strict'

const { sorobanFactoryTvl } = require('../../helper/chain/sorobanFactory')
const methodologies = require('../../helper/methodologies')

const PHOENIX_FACTORY = 'CB4SVAWJA6TSRNOJZ7W2AWFW46D5VR4ZMFZKDIKXEINZCZEGZCJZCKMI'

async function tvl(api) {
  await sorobanFactoryTvl(api, PHOENIX_FACTORY, { style: 'vec', queryFn: 'query_pools' })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `${methodologies.dexTVL}. Pool list is enumerated live from the Phoenix factory contract on Soroban. Each pool's USD value is sourced from stellar.expert API.`,
  stellar: { tvl },
}
