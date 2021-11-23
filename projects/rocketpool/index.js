const sdk = require("@defillama/sdk");
const abi = require('./abi.json')

const rocketNetworkBalances_contract = '0x138313f102cE9a0662F826fCA977E3ab4D6e5539'
const rocketNodeStaking_contract = '0x3019227b2b8493e45Bf5d25302139c9a2713BF15'

const rocketMinipoolQueue = '0x5870dA524635D1310Dc0e6F256Ce331012C9C19E'
const rocketDepositPool = '0x4D05E3d48a938db4b7a9A59A802D5b45011BDe58'
const rocketMinipoolManager = '0x6293B8abC1F36aFB22406Be5f96D893072A8cF3a'

/*
"rocketNodeStaking.getNodeEffectiveRPLStake"
"rocketNodeStaking.getTotalRPLStake"
"rocketNetworkBalances.getTotalETHBalance"
"rocketMinipoolQueue.getTotalLength"

https://etherscan.io/address/0x138313f102cE9a0662F826fCA977E3ab4D6e5539#readContract
https://etherscan.io/address/0x3019227b2b8493e45Bf5d25302139c9a2713BF15#readContract
https://etherscan.io/address/0x5870dA524635D1310Dc0e6F256Ce331012C9C19E#readContract
*/

const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const rpl = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'


async function tvl(timestamp, ethBlock, chainBlocks) {
  // Get ETH staked for rETH
  // Also get RPL staked by Node Operators to spin up a node
  /*
  const [ethBalance, stakedRPL] = await Promise.all([ 
    sdk.api.abi.call({
      target: rocketNetworkBalances_contract,
      abi: abi['rocketNetworkBalances.getTotalETHBalance'],
      block: ethBlock,
      chain: 'ethereum'
    }), // 978k
    sdk.api.abi.call({
      target: rocketNodeStaking_contract,
      abi: abi['rocketNodeStaking.getTotalRPLStake'],
      block: ethBlock,
      chain: 'ethereum'
    })
  ])
  */
  const {output: ethBalance} = await sdk.api.abi.call({
      target: rocketNetworkBalances_contract,
      abi: abi['rocketNetworkBalances.getTotalETHBalance'],
      block: ethBlock,
      chain: 'ethereum'
    })
  const {output: stakedRPL} = await sdk.api.abi.call({
      target: rocketNodeStaking_contract,
      abi: abi['rocketNodeStaking.getTotalRPLStake'],
      block: ethBlock,
      chain: 'ethereum'
  })
  const {output: totalCapacity} = await sdk.api.abi.call({
      target: rocketMinipoolQueue,
      abi: abi['rocketMinipoolQueue.getTotalCapacity'],
      block: ethBlock,
      chain: 'ethereum'
  })
  // const totalCapacity = 16 * poolsTotalLength

  const {output: poolBalance} = await sdk.api.abi.call({
    target: rocketDepositPool,
    abi: abi['rocketDepositPool.getBalance'],
    block: ethBlock,
    chain: 'ethereum'
  })
  const {output: stakingMinipoolCount} = await sdk.api.abi.call({ // minipoolCountPerStatus
    target: rocketMinipoolManager,
    // params: ['0', '1000'],
    // abi: abi['rocketMinipoolManager.getMinipoolCountPerStatus'],
    abi: abi['rocketMinipoolManager.getStakingMinipoolCount'],
    block: ethBlock,
    chain: 'ethereum'
  })
  // initialisedCount, prelaunchCount, stakingCount, withdrawableCount, dissolvedCount
  const stakedEth = stakingMinipoolCount * 32
  
  // TotalCapacity = 4064
  // GetTotalLength: 254
  // Grafana formula: It's just the TVL from the node op dashboard
  // + rocketpool_demand_deposit_pool_balance
  // + rocketpool_demand_total_minipool_capacity
  // + 32 * rocketpool_supply_active_minipools 
  // + rocketpool_rpl_total_value_staked * rocketpool_rpl_rpl_price

  const rocketpool_demand_deposit_pool_balance = poolBalance
  const rocketpool_demand_total_minipool_capacity = totalCapacity
    


  console.log(`rocketNetworkBalances.getTotalETHBalance: ${ethBalance / 1e18} // ${rocketNetworkBalances_contract}\nrocketNodeStaking.getTotalRPLStake: ${stakedRPL / 1e18} // ${rocketNodeStaking_contract}\nrocketMinipoolQueue.getTotalLength * 16 = getTotalCapacity=rocketpool_demand_total_minipool_capacity: ${totalCapacity / 1e18} // ${rocketMinipoolQueue}\nrocketDepositPool.getBalance=rocketpool_demand_deposit_pool_balance: ${poolBalance / 1e18} // ${rocketDepositPool}\nrocketMinipoolManager.getStakingMinipoolCount * 32: ${stakedEth} // ${rocketMinipoolManager}\n`)

  const balances = {
    [weth]: stakedEth * 1e18, 
    [rpl]: stakedRPL
  }

  return balances
}

module.exports = {
  methodology: "Rocketpool",
  ethereum: {
    tvl,
  },
};
