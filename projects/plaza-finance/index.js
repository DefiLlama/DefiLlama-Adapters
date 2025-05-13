const PREDEPOSIT = '0xce2fD6e5BFABd5136e1D94A2F1a9f4241c9593D4'
const ETH_POOL = '0x7cA62A2Dc82ca66C620a6a0aC4F986fd98959f6a'
const BALANCER_POOL = '0xE6f687297b59FFa461226748B5891B1704C9A1b7'
const PREDEPOSIT_TOKENS = [
  "0x4200000000000000000000000000000000000006", // WETH
  "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", // cbETH
  "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A", // weETH
  "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", // wstETH
  "0x2416092f143378750bb29b79eD961ab195CcEea5", // ezETH
  "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c", // rETH
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
    [1742839200,"PreDeposit Launch"],
    [1745852400,"ETH Pool Launch"]
  ],
}
