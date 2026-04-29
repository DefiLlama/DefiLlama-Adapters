const ADDRESSES = require('./helper/coreAssets.json')
const { call, sumSingleBalance } = require('./helper/chain/near')

const META_POOL_CONTRACT = 'meta-pool.near'

async function tvl() {
  const balances = {}
  const state = await call(META_POOL_CONTRACT, 'get_contract_state', {})

  // total_for_staking: NEAR backing every stNEAR holder
  // nslp_liquidity:    NEAR sitting in the stNEAR/NEAR liquidity pool
  const totalYocto = (
    BigInt(state.total_for_staking) + BigInt(state.nslp_liquidity)
  ).toString()

  sumSingleBalance(balances, 'wrap.near', totalYocto)
  return balances
}

module.exports = {
  methodology:
    'TVL counts the NEAR tokens managed by the Meta Pool liquid-staking contract (meta-pool.near): NEAR backing every stNEAR holder (total_for_staking) plus NEAR provided to the stNEAR/NEAR liquidity pool (nslp_liquidity). Both values are read on-chain via get_contract_state(), removing the previous dependency on the narwallets metrics_json API.',
  near: { tvl, },
  aurora: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: '0xb01d35D469703c6dc5B369A1fDfD7D6009cA397F' })
      api.add(ADDRESSES.aurora.AURORA, totalSupply)
    }
  }
}
