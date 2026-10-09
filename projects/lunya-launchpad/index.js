const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  arc: {
    // LunyaLaunchFactory, placed through CreateX with CREATE3 at the same address on every chain
    factory: '0xFB68A7bdc87B6754b5DD092586b8E2904BaAD46E',
    fromBlock: 21067677,
  },
}

// The trailing bytes are the launch's parameters
const LAUNCH_CREATED = 'event LaunchCreated(address indexed launch, address indexed token, address indexed creator, uint8 launchType, address quoteToken, string name, string symbol, string contractURI, bytes launchParams)'

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const launches = await getLogs2({ api, target: factory, eventAbi: LAUNCH_CREATED, fromBlock })
  if (!launches.length) return

  // reserve() is the quote a curve actually holds. The contract's balance is not used because it
  // also carries creator and protocol fees awaiting collection, and the curve's virtual reserve was
  // never deposited. A graduated launch's reserve is zero: its liquidity lives in a Lunya DEX pool.
  const reserves = await api.multiCall({ abi: 'uint256:reserve', calls: launches.map(l => l.launch) })
  launches.forEach((l, i) => api.add(l.quoteToken, reserves[i]))
}

module.exports = {
  methodology: 'Counts the quote tokens held in every Lunya bonding curve that has not yet graduated, read from each launch\'s reserve. The launched token\'s own unsold supply is not counted, and neither are fees awaiting collection. Once a launch graduates its liquidity moves into a Lunya DEX pool and is counted under Lunya DEX instead.',
  arc: { tvl },
}
