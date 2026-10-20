const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports, getStakedEthTVL } = require('../helper/utils');

// Golem Network (Golem Factory).
const treasury = "0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9";
const GLM = "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429";

// withdrawal addresses of the Factory's validators, https://blog.golem.network/eth-staking-tests-summary/
const withdrawalAddresses = [
  '0x4297cc867B85B63297c34af4268ced9CaFC66F5a',
  '0x485aD74f70eA3ad814D1dfE7A9284085499DE682',
  '0x3dD89506d79f53DaD1B252fb9301Bc95C9792354',
  '0xFC6E18E22Ad11592494B3D541bA25Af63A807527',
]

// The beacon proxy only answers for the current state, so past dates use the deposits made to
// these withdrawal addresses: [timestamp of the first deposit that day, cumulative ETH deposited],
// from the deposit contract's DepositEvent logs.
const stakedHistory = [
  [1719325163, 192],    // 2024-06-25
  [1719871931, 6592],   // 2024-07-01
  [1719878807, 9792],   // 2024-07-02
  [1720539071, 9856],   // 2024-07-09
  [1720628615, 29056],  // 2024-07-10
  [1720679387, 85056],  // 2024-07-11
  [1720791587, 91456],  // 2024-07-12
  [1721048147, 104256], // 2024-07-15
  [1721396375, 117056], // 2024-07-19
  [1725282239, 136256], // 2024-09-02
]

const utcDate = (timestamp) => new Date(timestamp * 1e3).toISOString().slice(0, 10)

// A run for any day but today is a refill
const isHistoricalRun = (api) => utcDate(api.timestamp) !== utcDate(Math.floor(Date.now() / 1e3))

const liveStakedEth = getStakedEthTVL({ withdrawalAddresses, proxy: true })

async function stakedEth(api) {
  if (!isHistoricalRun(api)) return liveStakedEth(api)
  const step = stakedHistory.findLast(([ts]) => api.timestamp >= ts)
  if (step) api.addGasToken(step[1] * 1e18)
  return api.getBalances()
}

module.exports = mergeExports([
  treasuryExports({
    ethereum: {
      tokens: [nullAddress],
      owners: [treasury, '0xFC6E18E22Ad11592494B3D541bA25Af63A807527'],
      ownTokens: [GLM],
    },
  }),
  { ethereum: { tvl: stakedEth } },
])

module.exports.methodology = "ETH and GLM held by the Golem Factory treasury, plus the ETH staked in its validators (withdrawal addresses from https://blog.golem.network/eth-staking-tests-summary/). Staked ETH is read from the beacon chain for the current day; past dates use the cumulative deposits made to those withdrawal addresses."
