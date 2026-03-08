const BCHEM = '0x9102E0A76a5e2823073Ed763a32Ba8ca8521b1F3'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'

const STAKING = '0x01F82039810f18F703F4c8b943940ce04Fa00C78'

const UNISWAP_V4_POOL_KEYS = {
  USDT: '0xa41edf5a64964f2dea4b59b3d5a19cbf2198ef0e20b5309fdbb265d3a234c390',

}

// Uniswap v4'te havuz bazlı bakiyeler pool address yerine manager altında tutulur.
// Bu nedenle adapter, protokolün gerçek varlıklarını tutan holder adreslerini okur.
// TODO: Bu adresleri canlıdaki doğru custody/holder kontratlarıyla güncelleyin.
const TVL_HOLDER_ADDRESSES = [
  '0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF',

]

const erc20BalanceOfAbi = 'function balanceOf(address) view returns (uint256)'
const totalStakedAbi = 'function totalStaked() view returns (uint256)'
const rewardVaultAbi = 'function rewardVault() view returns (uint256)'

/**
 * Swap/Liquidity TVL:
 * Uniswap v4 havuzlarına ait holder adreslerindeki BCHEM/USDT/USDC bakiyeleri toplanır.
 */
async function liquidityPoolTvl(api) {
  const calls = []
  for (const holder of TVL_HOLDER_ADDRESSES) {
    calls.push({ target: BCHEM, params: [holder] })
    calls.push({ target: USDT, params: [holder] })
  }

  const balances = await api.multiCall({
    abi: erc20BalanceOfAbi,
    calls,
  })

  for (let i = 0; i < balances.length; i += 3) {
    api.add(BCHEM, balances[i])
    api.add(USDT, balances[i + 1])
  }
}

/**
 * Staking TVL:
 * Staking kontratındaki kullanıcı stake'i + henüz dağıtılmamış reward kasası.
 */
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
    `TVL, BSC üzerinde on-chain olarak hesaplanır. Uniswap v4 pool key'leri: USDT=${UNISWAP_V4_POOL_KEYS.USDT} . Swap/Liquidity TVL: ilgili pool'lara ait holder adreslerindeki BCHEM/USDT/USDC bakiyeleri toplamı. Staking TVL: staking kontratındaki totalStaked + rewardVault BCHEM.`,
  bsc: {
    tvl: liquidityPoolTvl,
    staking: stakingTvl,
  },
}
