

const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances')
let _stakedResponse

const mapping = {
  harmony: 'Harmony',
  icon: 'Icon',
  ontology: 'Ontology',
  tron: 'Tron',
  iotex: 'IoTeX',
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
}

function stakingChain(chain) {
  module.exports[chain] = {
    tvl: async () => {
      if (!_stakedResponse) _stakedResponse = get('https://data.unifi.report/api/stake-data/grouped')
      const { results } = await _stakedResponse
      const blockchainName = mapping[chain]
      const { delegated_stake_usd } = results.find(i => i.blockchain === blockchainName)
      return toUSDTBalances(delegated_stake_usd)
    }
  }
}

Object.keys(mapping).forEach(stakingChain)