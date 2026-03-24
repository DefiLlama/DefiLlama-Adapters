const { getLogs } = require('../helper/cache/getLogs')
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.ethereum.USDC
const USDT = ADDRESSES.ethereum.USDT
const stables = new Set([USDC, USDT])

const eventAbis = {
  swapCreated: 'event SwapRequestCreated(uint256 indexed id, address indexed provider, address token, uint256 amount, uint256 minExpectedAmount)',
  mintCreated: 'event MintRequestCreated(uint256 indexed id, address indexed provider, address depositToken, uint256 amount, uint256 minMintAmount)',
  burnCompleted: 'event BurnRequestCompleted(uint256 indexed id, uint256 burnedAmount, uint256 withdrawalAmount)',
}

// Deposit sources: old counters + new request managers
const depositSources = [
  { target: '0xa27a69Ae180e202fDe5D38189a3F24Fe24E55861', fromBlock: 21488190, key: 'usr-counter', eventAbi: eventAbis.swapCreated },       // USR Counter
  { target: '0xc7ab90c2ea9271efb31f5fa2843eeb4b331eafa0', fromBlock: 21488171, key: 'rlp-counter', eventAbi: eventAbis.swapCreated },       // RLP Counter
  { target: '0xAC85eF29192487E0a109b7f9E40C267a9ea95f2e', fromBlock: 21615928, key: 'usr-manager-mint', eventAbi: eventAbis.mintCreated },  // USR Requests Manager
  { target: '0x10f4d4EAd6Bcd4de7849898403d88528e3Dfc872', fromBlock: 20862632, key: 'rlp-manager-mint', eventAbi: eventAbis.mintCreated },  // RLP Requests Manager
]

// Withdrawal sources: only request managers have burn completion events
const withdrawalSources = [
  { target: '0xAC85eF29192487E0a109b7f9E40C267a9ea95f2e', fromBlock: 21615928, key: 'usr-manager-burn' },  // USR Requests Manager
  { target: '0x10f4d4EAd6Bcd4de7849898403d88528e3Dfc872', fromBlock: 20862632, key: 'rlp-manager-burn' },  // RLP Requests Manager
]

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const [depositLogs, withdrawalLogs] = await Promise.all([
        Promise.all(depositSources.map(s => getLogs({ api, target: s.target, eventAbi: s.eventAbi, onlyArgs: true, fromBlock: s.fromBlock, extraKey: s.key }))),
        Promise.all(withdrawalSources.map(s => getLogs({ api, target: s.target, eventAbi: eventAbis.burnCompleted, onlyArgs: true, fromBlock: s.fromBlock, extraKey: s.key }))),
      ])

      let totalDeposits = 0n
      for (const logs of depositLogs) {
        for (const log of logs) {
          if (stables.has(log[2].toLowerCase())) {
            totalDeposits += log[3]
          }
        }
      }

      let totalWithdrawals = 0n
      for (const logs of withdrawalLogs) {
        for (const log of logs) {
          totalWithdrawals += log[2]
        }
      }

      api.addUSDValue(Number(totalDeposits - totalWithdrawals) / 1e6)
    },
    staking: staking('0xFE4BCE4b3949c35fB17691D8b03c3caDBE2E5E23', '0x259338656198eC7A76c729514D3CB45Dfbf768A1'),
  }
}
