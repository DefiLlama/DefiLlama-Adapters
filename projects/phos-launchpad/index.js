const { getLogs2 } = require('../helper/cache/getLogs')
const { nullAddress } = require('../helper/tokenMapping')

const FACTORY = '0xc5DF918b40BeAad05bd84F88FD39550AedEB4c71'

const LaunchCreated = 'event LaunchCreated(address indexed launch, address indexed creator, bytes params, uint256 time)'

async function tvl(api) {
  const logs = await getLogs2({ api, target: FACTORY, fromBlock: 48581493, eventAbi: LaunchCreated })
  return api.sumTokens({ owners: logs.map((i) => i.launch), tokens: [nullAddress] })
}

module.exports = {
  methodology:
    'Sums the native XP held by every sale contract the Phos launchpad factory has created on Xphere: contributions to sales that are still selling, unclaimed refunds owed by failed ones, and the platform fee a graduated sale holds until an admin withdraws it. A graduated sale keeps none of its liquidity, that sits in the pool the Phos Swap adapter reads.',
  start: '2026-09-14',
  xp: { tvl },
}
