// TVL is the native asset (ETH on Robinhood Chain, USDC on Arc) held by bonding curves that have not
// graduated yet. Every Uniswap v4 pool is left out: a graduated curve's reserve and every Doppler
// pool's liquidity are Uniswap v4 TVL.
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
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

async function tvl(api) {
  const { factory, fromBlock } = deployments[api.chain]
  const launches = await getLogs2({ api, target: factory, eventAbi: TokenLaunched, fromBlock })
  const curves = launches.map(i => i.curve)
  const graduated = await api.multiCall({ abi: 'bool:graduated', calls: curves })
  return sumTokens2({ api, owners: curves.filter((_, i) => !graduated[i]), tokens: [nullAddress] })
}

module.exports = {
  methodology: 'Native asset (ETH on Robinhood Chain, USDC on Arc) held by frenlaunch bonding curves that have not graduated. Curves are enumerated from the factory\'s TokenLaunched events. Graduated pools and Doppler pools are Uniswap v4 liquidity and are excluded.',
}
Object.keys(deployments).forEach(chain => { module.exports[chain] = { tvl } })
