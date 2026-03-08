const BCHEM = '0x9102E0A76a5e2823073Ed763a32Ba8ca8521b1F3'
const USDT = '0x55d398326f99059fF775485246999027B3197955'


const STAKING = '0x01F82039810f18F703F4c8b943940ce04Fa00C78'


const UNISWAP_V4_POOL_ADDRESSES = [
  '0xa41edf5a64964f2dea4b59b3d5a19cbf2198ef0e20b5309fdbb265d3a234c390', // BCHEM/USDT pool

]

const erc20BalanceOfAbi = 'function balanceOf(address) view returns (uint256)'
const totalStakedAbi = 'function totalStaked() view returns (uint256)'
const rewardVaultAbi = 'function rewardVault() view returns (uint256)'


async function liquidityPoolTvl(api) {
  const calls = []
  for (const pool of UNISWAP_V4_POOL_ADDRESSES) {
    calls.push({ target: BCHEM, params: [pool] })
    calls.push({ target: USDT, params: [pool] })
  }

  const balances = await api.multiCall({
    abi: erc20BalanceOfAbi,
    calls,
  })

  for (let i = 0; i < balances.length; i += 2) {
    api.add(BCHEM, balances[i])
    api.add(USDT, balances[i + 1])

  }
}


async function stakingTvl(api) {
  const [totalStaked, rewardVault] = await Promise.all([
    api.call({ target: STAKING, abi: totalStakedAbi }),
    api.call({ target: STAKING, abi: rewardVaultAbi }),
  ])

  api.add(BCHEM, totalStaked)
  api.add(BCHEM, rewardVault)
}

module.exports = {
  methodology:
    ,
  bsc: {
    tvl: liquidityPoolTvl,
    staking: stakingTvl,
  },
}
