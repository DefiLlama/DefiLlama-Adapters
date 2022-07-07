const utils = require('../helper/utils')
const { toUSDTBalances } = require('../helper/balances');

const url = 'https://bridge.orbitchain.io/open/v1/api/dashboard/stats'

const chains = [
  'avax',
  'bsc',
  'celo',
  'eth',
  'fantom',
  'harmony',
  'heco',
  'icon',
  'klaytn',
  'matic',
  'moonriver',
  'oec',
  'orbit',
  'xdai',
  'xrp'
]

function chainTvl(chain) {
  return async () => {
    const { data } = await utils.fetchURL(url)
    const tvlList = data.info.chain_tvl
      
    return toUSDTBalances(tvlList[chain])
  }
}

const chainTvls = {}
chains.forEach((chain) => {
  let chainName

  switch (chain) {
    case 'avax': chainName = 'avalanche'; break;
    case 'eth': chainName = 'ethereum'; break;
    case 'oec': chainName = 'okexchain'; break;
    case 'matic': chainName = 'polygon'; break;
    case 'xrp': chainName = 'ripple'; break;
    default: chainName = chain
  }

  chainTvls[chainName] = {
    tvl: chainTvl(chain)
  }
})

module.exports = {
  methodology: 'Tokens locked in Orbit Bridge contract are counted as TVL',
  misrepresentedTokens: true,
  timetravel: false,
  ...chainTvls,
}