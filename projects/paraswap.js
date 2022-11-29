const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const axios = require("axios")
const {sumBalancerLps} = require("./helper/unwrapLPs.js")

// PSP staking for sPSP in each PMM pool (used for signalling amon other things)
const PSP = '0xcafe001067cdef266afb7eb5a286dcfd277f3de5'
const pools_url = 'https://api.paraswap.io/staking/pools/1'
async function staking(timestamp, ethBlock, chainBlocks) {
  const {data} = await axios.get(pools_url)
  const pools = data.pools.map(p => p.address)

  const poolsBalances = (
    await sdk.api.abi.multiCall({
      calls: pools.map(sPSP => ({target: PSP, params: sPSP})),
      abi: 'erc20:balanceOf',
      block: ethBlock,
      chain: 'ethereum'
    })
  ).output
  
  const balances = {}
  poolsBalances.forEach(t => {
    const token = t.input.target
    balances[token] = (new BigNumber(balances[token] || "0").plus(new BigNumber(t.output)) ).toString(10)
  })
  return balances
}

// Safety Module staking of 20WETH_80PSP balancer LP
// pool2(safetyModuleBalStaking, balancerLP_20WETH_80PSP, "ethereum") // not working as it is a balancer and not a uniswap LP
const balancerLP_20WETH_80PSP = '0xcb0e14e96f2cefa8550ad8e4aea344f211e5061d'
const safetyModuleBalStaking = '0xc8dc2ec5f5e02be8b37a8444a1931f02374a17ab'
async function safetyModuleStaking(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  await sumBalancerLps(balances, [[balancerLP_20WETH_80PSP, safetyModuleBalStaking]], ethBlock, 'ethereum', a=>a)
  return balances
}

module.exports = {
  methodology: "PSP can be staked in staking pools, one pool per Private Market Maker, to signal and share the PMM benefits",
  ethereum: {
    staking,
    pool2: safetyModuleStaking,
    tvl: () => ({}), 
  },
}
