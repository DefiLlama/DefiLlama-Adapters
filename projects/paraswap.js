const {sumTokens2, } = require("./helper/unwrapLPs.js")
const { getConfig } = require("./helper/cache.js")
const { stakings } = require("./helper/staking.js")

// PSP staking for sPSP in each PMM pool (used for signalling amon other things)
const PSP = '0xcafe001067cdef266afb7eb5a286dcfd277f3de5'
const pools_url = 'https://api.paraswap.io/staking/pools/1'
async function staking(api) {
  const data = await getConfig('paraswap', pools_url)
  const owners = data.pools.map(p => p.address).concat(["0x716fBC68E0c761684D9280484243FF094CC5FfAB"])
  return sumTokens2({ api, owners, tokens: [PSP]})
}

// Safety Module staking of 20WETH_80PSP balancer LP
// pool2(safetyModuleBalStaking, balancerLP_20WETH_80PSP) // not working as it is a balancer and not a uniswap LP
const balancerLP_20WETH_80PSP = '0xcb0e14e96f2cefa8550ad8e4aea344f211e5061d'
const safetyModuleBalStaking = '0xc8dc2ec5f5e02be8b37a8444a1931f02374a17ab'
async function safetyModuleStaking(api) {
  return sumTokens2({ api, owners: [safetyModuleBalStaking, "0x593F39A4Ba26A9c8ed2128ac95D109E8e403C485"], tokens: [balancerLP_20WETH_80PSP]})
}

module.exports = {
  methodology: "PSP can be staked either on its single asset sePSP pool or 2x boosted sePSP2, an 80/20 balancer pool. Staking allows users to receive Revenue based on their boosted actions.",
  ethereum: {
    staking,
    pool2: safetyModuleStaking,
    tvl: () => ({}), 
  },
  optimism: {
    staking: stakings(["0x8C934b7dBc782568d14ceaBbEAeDF37cB6348615"], "0xd3594E879B358F430E20F82bea61e83562d49D48"),
    pool2: stakings(["0x26Ee65874f5DbEfa629EB103E7BbB2DEAF4fB2c8"], "0x11f0b5cca01b0f0a9fe6265ad6e8ee3419c68440"),
    tvl: () => ({}), 
  },
}
