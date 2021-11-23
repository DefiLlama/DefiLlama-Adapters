const sdk = require("@defillama/sdk")
const abi = require('./abi.json')

const rocketMinipoolManager = '0x6293B8abC1F36aFB22406Be5f96D893072A8cF3a'
const rocketNodeStaking_contract = '0x3019227b2b8493e45Bf5d25302139c9a2713BF15'
// const rocketNetworkBalances_contract = '0x138313f102cE9a0662F826fCA977E3ab4D6e5539'
// const rocketMinipoolQueue = '0x5870dA524635D1310Dc0e6F256Ce331012C9C19E'
// const rocketDepositPool = '0x4D05E3d48a938db4b7a9A59A802D5b45011BDe58'

const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const rpl = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'

async function tvl(timestamp, ethBlock, chainBlocks) {
  // Get ETH staked for rETH, which is given by users and Node Operators
  // Also get RPL staked by Node Operators to spin up a node
  const [{output: stakedRPL}, {output: activeMinipoolCount}] = await Promise.all([ 
    sdk.api.abi.call({
      target: rocketNodeStaking_contract,
      abi: abi['rocketNodeStaking.getTotalRPLStake'],
      block: ethBlock,
      chain: 'ethereum'
    }), 
    sdk.api.abi.call({ 
      target: rocketMinipoolManager,
      abi: abi['rocketMinipoolManager.getStakingMinipoolCount'],
      block: ethBlock,
      chain: 'ethereum'
    })
  ])
  const stakedEth = activeMinipoolCount * 32 

  console.log(`rocketNodeStaking.getTotalRPLStake: ${stakedRPL / 1e18} // ${rocketNodeStaking_contract}\nrocketMinipoolManager.getStakingMinipoolCount * 32: ${stakedEth} // ${rocketMinipoolManager}\n`)

  const balances = {
    [weth]: stakedEth * 1e18, 
    [rpl]: stakedRPL
  }
  return balances
}

module.exports = {
  methodology: "Rocketpool TVL is ethereum staked by the users and node operators - collateral provided against rETH - staked on beacon chain 32 * activeMinipoolCount + RPL staked by Node Operators to operate a node.",
  ethereum: {
    tvl,
  },
}

/*
  Final choice with Rocketpool team: Most accurate way to represent that TVL:
 - ETH locked in the deposit contract, which would be 32 * rocketMinipoolManager.getActiveMinipoolCount = 32 * 499
 - RPL locked by Node Operators rocketNodeStaking.getTotalRPLStake
*/