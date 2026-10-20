const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports, getStakedEthTVL } = require('../helper/utils');

const GLM = "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429";
const withdrawalAddress = '0xba1951dF0C0A52af23857c5ab48B4C43A57E7ed1' // receives the staking rewards of the Foundation's validators

// The beacon proxy only answers for the current state, so past dates use the deposits made to
// the withdrawal address: [timestamp of the first deposit that day, cumulative ETH deposited],
// from the deposit contract's DepositEvent logs.
const stakedHistory = [
  [1686056351, 64],     // 2023-06-06
  [1686121535, 2048],   // 2023-06-07
  [1690374791, 14848],  // 2023-07-26
  [1690537727, 100064], // 2023-07-28
  [1706879363, 100416], // 2024-02-02
]

const utcDate = (timestamp) => new Date(timestamp * 1e3).toISOString().slice(0, 10)

// A run for any day but today is a refill
const isHistoricalRun = (api) => utcDate(api.timestamp) !== utcDate(Math.floor(Date.now() / 1e3))

const liveStakedEth = getStakedEthTVL({ withdrawalAddress, proxy: true })

async function stakedEth(api) {
  if (!isHistoricalRun(api)) return liveStakedEth(api)
  const step = stakedHistory.findLast(([ts]) => api.timestamp >= ts)
  if (step) api.addGasToken(step[1] * 1e18)
  return api.getBalances()
}

module.exports = mergeExports([
  treasuryExports({
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.WETH],
      owners: [withdrawalAddress, '0x70a0a7be87deb51e1fab16d4f2bf00be1510e476', '0x3d4530082c3eb60f58af03f79b1ed3f40e591cd1'],
      ownTokens: [GLM],
    },
  }),
  { ethereum: { tvl: stakedEth } },
])

module.exports.methodology = "ETH, WETH and GLM held by the Golem Foundation wallets, plus the ETH staked in its validators (withdrawal address 0xba1951dF0C0A52af23857c5ab48B4C43A57E7ed1). Staked ETH is read from the beacon chain for the current day; past dates use the cumulative deposits made to that withdrawal address."
