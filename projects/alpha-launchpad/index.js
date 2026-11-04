const { getLogs2 } = require('../helper/cache/getLogs')

const launched = 'event Launched(address indexed market, address indexed token, address indexed creator, address quote, bool nativeAlpha)'

// LaunchFactory per chain, fromBlock is the factory deployment block
const config = {
  robinhood: { factory: '0xD45D538AA6Ab9261A638b9Df83312f823BB368fC', fromBlock: 103445727 },
  base: { factory: '0x7cdd6aCD10144C89B630Bce8b2031d80df57628c', fromBlock: 53375932 },
  bsc: { factory: '0x71abe80C8f08ebE5dac018601170e687ED737AC3', fromBlock: 131062839 },
  ethereum: { factory: '0x2DC4f507BD30c6b5df90B288FaeCDeCE627386Ec', fromBlock: 26320476 },
  arc: { factory: '0x11A5ac5fC2A1e7D4bF61B781b0b784462C2BD9e7', fromBlock: 28998006 },
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, target: factory, eventAbi: launched, fromBlock })
  // A market's quote balance also holds unsettled fees, so read the curve principal instead
  const principals = await api.multiCall({ abi: 'uint256:principal', calls: logs.map(l => l.market) })
  api.add(logs.map(l => l.quote), principals)
}

module.exports = {
  methodology: 'TVL is the pairing asset held as curve principal by each ALPHA bonding-curve market. Markets are read from the factory Launched events. Fees waiting to be settled are excluded. Graduated liquidity sits in Uniswap v4 and is not counted here.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
