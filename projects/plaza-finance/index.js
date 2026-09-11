const ADDRESSES = require('../helper/coreAssets.json')
const PREDEPOSIT = '0xce2fD6e5BFABd5136e1D94A2F1a9f4241c9593D4'
const ETH_POOL = '0x7cA62A2Dc82ca66C620a6a0aC4F986fd98959f6a'
const BALANCER_POOL = '0xE6f687297b59FFa461226748B5891B1704C9A1b7'
const PREDEPOSIT_TOKENS = [
  ADDRESSES.optimism.WETH_1, // WETH
  ADDRESSES.base.cbETH, // cbETH
  ADDRESSES.bsc.weETH, // weETH
  ADDRESSES.base.wstETH, // wstETH
  ADDRESSES.optimism.ezETH, // ezETH
  ADDRESSES.base.rETH, // rETH
  "0xEDfa23602D0EC14714057867A78d01e94176BEA0", // wrsETH
]

async function tvl(api) {
  // Handle PreDeposit TVL pre-launch
  await api.sumTokens({ owner: PREDEPOSIT, tokens: PREDEPOSIT_TOKENS })

  // Handle ETHPool TVL post-launch, where PreDeposit assets were deposited to Balancer and moved to ETHPool
  const poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: BALANCER_POOL })
  const vault = await api.call({ abi: 'address:getVault', target: BALANCER_POOL })
  const { tokens, balances } = await api.call({
    target: vault,
    abi: 'function getPoolTokens(bytes32) view returns (address[] tokens, uint256[] balances, uint256)',
    params: poolId,
  })

  // Get our ownership ratio
  const [totalSupply, poolBalance] = await Promise.all([
    api.call({ target: BALANCER_POOL, abi: 'function getActualSupply() view returns (uint256)' }),
    api.call({ target: BALANCER_POOL, abi: 'erc20:balanceOf', params: ETH_POOL }),
  ])

  const ratio = poolBalance / totalSupply
  const poolBalances = balances.map(i => i * ratio)

  api.addTokens(tokens, poolBalances)

  return api.getBalances()
}

module.exports = {
  methodology: "Sum of all ETH LSTs/LRTs in the PreDeposit contract pre-launch. ETHPool TVL as balancer tokens post-launch.",
  start: 1742839200,
  base: { tvl },
  hallmarks: [
    ['2025-03-24',"PreDeposit Launch"],
    ['2025-04-28',"ETH Pool Launch"]
  ],
}
