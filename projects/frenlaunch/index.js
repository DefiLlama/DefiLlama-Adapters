// DefiLlama TVL adapter for frenlaunch (projects/frenlaunch/index.js in DefiLlama/DefiLlama-Adapters).
// TVL is the native asset (ETH on Robinhood Chain, USDC on Arc) that traders have paid into bonding
// curves that have not graduated yet. Fees the curves hold for creators and the platform are left
// out (they are earnings, not deposits), and so is every Uniswap v4 pool: a graduated curve's
// reserve and every Doppler pool's liquidity are Uniswap v4 TVL.
const { getLogs2 } = require('../helper/cache/getLogs')
const deployments = {
  "robinhood": {
    "factory": "0x2c40C69d5E1AA1D0d7Ee20De7d439BF683804F8B",
    "fromBlock": 49600000
  },
  "arc": {
    "factory": "0xA3c7Cae6f64785f54E11f984bAdb35f2f4E08ea9",
    "fromBlock": 21687000
  }
}

const TokenLaunched = 'event TokenLaunched(address indexed token, address indexed curve, address indexed creator, bytes32 salt, string name, string symbol, uint256 totalSupply)'

function tvlOf({ factory, fromBlock }) {
  return async (api) => {
    const launches = await getLogs2({ api, target: factory, eventAbi: TokenLaunched, fromBlock })
    const curves = launches.map(i => i.curve)
    const [collected, graduated] = await Promise.all([
      api.multiCall({ abi: 'uint256:ethCollected', calls: curves }),
      api.multiCall({ abi: 'bool:graduated', calls: curves }),
    ])
    collected.forEach((amount, i) => { if (!graduated[i]) api.addGasToken(amount) })
  }
}

module.exports = {
  methodology: 'Native asset (ETH on Robinhood Chain, USDC on Arc) paid into frenlaunch bonding curves that have not graduated, read from each curve\'s ethCollected. Curves are enumerated from the factory\'s TokenLaunched events. Graduated pools and Doppler pools are Uniswap v4 liquidity and are excluded; so are fees the curves hold for creators and the platform.',
}
Object.entries(deployments).forEach(([chain, d]) => { module.exports[chain] = { tvl: tvlOf(d) } })
