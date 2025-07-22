const { get } = require('../helper/http')
const { staking } = require('../helper/staking');
const sdk = require('@defillama/sdk')
const { unwrapLPsAuto, nullAddress } = require('../helper/unwrapLPs')

const vaults = [
  '0xfcba43906259168ea610905e719e86f5b099391b',
  '0x6b9c0b05744bbe6e3d8df8bea31a029a12f7c0eb',
  '0x77ce0b0e9e629474c69a5d8d5fd9c3e6113dd058',
]

async function tvl(api) {
  const balances = {}
  let pools = await get('https://comb-breakdown.herokuapp.com/pools');
  const prices = {}
  pools.forEach(i => {
    if (i.asset)
    prices['fantom:'+i.asset.toLowerCase()] = i.lpPrice/1e18
  })


  const token = await api.multiCall({ calls: vaults, abi: 'address:token', })
  const supply = await api.multiCall({ calls: vaults, abi: 'uint256:totalSupply', })
  const price = await api.multiCall({ calls: vaults, abi: 'uint256:getPricePerFullShare', })


  const masterchef = '0x6e547e6Ab873146eA1E4A12499b0e98Bc18Ea222'
  let strategies = await api.fetchList({
    target: masterchef,
    itemAbi: 'function strategies(uint256) view returns (address)',
    lengthAbi: 'uint256:poolLength'
  })
  strategies = strategies.filter(i => i !== nullAddress)
  const token2 = await api.multiCall({ calls: strategies, abi: 'address:want', })
  const supply2 = await api.multiCall({ calls: strategies, abi: 'uint256:balanceOf', })

  token.map((v, i) => {
    sdk.util.sumSingleBalance(balances, v.toLowerCase(), supply[i] * price[i] / 1e18, api.chain)
  })
  token2.map((v, i) => {
    sdk.util.sumSingleBalance(balances, v.toLowerCase(), supply2[i], api.chain)
  })
  
  await unwrapLPsAuto({ api, balances })
  Object.entries(balances).forEach(([token, bal]) => {
    if (prices[token]) {
      sdk.util.sumSingleBalance(balances,'tether',prices[token] * bal)
      delete balances[token]
    }
  })
  return balances
}

module.exports = {
  timetravel: false,
  methodology: 'Fetches pools (masterchef), vaults, and zcomb data from external APIs and sums up the total locked values (TVL). The TVLs are calculated by taking the lp balances and its price of the strategies and adding them up. The zcomb tvl is calculated by taking the total locked comb and multiplying it by its market value.',
  fantom: {
    tvl,
    staking: staking('0xdecce40d4176abefb4c709b2220c8396fe710cf7', '0xae45a827625116d6c0c40b5d7359ecf68f8e9afd'),
  }
}
