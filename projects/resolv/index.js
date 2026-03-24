const { getLogs } = require('../helper/cache/getLogs')
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.ethereum.USDC
const USDT = ADDRESSES.ethereum.USDT
const WETH = ADDRESSES.ethereum.WETH
const ETH = ADDRESSES.null
const stables = new Set([USDC, USDT, WETH, ETH])

const eventAbis = {
  mintCreated: 'event MintRequestCreated(uint256 indexed id, address indexed provider, address depositToken, uint256 amount, uint256 minMintAmount)',
  mintCancelled: 'event MintRequestCancelled(uint256 indexed id)',
  swapCreated: 'event SwapRequestCreated(uint256 indexed id, address indexed provider, address token, uint256 amount, uint256 minExpectedAmount)',
  swapCancelled: 'event SwapRequestCancelled(uint256 indexed id)',
  burnCompleted: 'event BurnRequestCompleted(uint256 indexed id, uint256 burnedAmount, uint256 withdrawalAmount)',
}

// Deposit + withdrawal sources: request managers (MintRequestCreated + BurnRequestCompleted)
const managers = [
  { target: '0x1De327C23ed8F52f797D55B31ABCe98cb46C8EA9', fromBlock: 21000761, key: 'old-usr-manager' }, // Old USR Requests Manager
  { target: '0xAC85eF29192487E0a109b7f9E40C267a9ea95f2e', fromBlock: 21615928, key: 'usr-manager' },     // USR Requests Manager
  { target: '0x10f4d4EAd6Bcd4de7849898403d88528e3Dfc872', fromBlock: 20862632, key: 'rlp-manager' },     // RLP Requests Manager
]

// Deposit-only sources: old counters (SwapRequestCreated, no burn mechanism)
const counters = [
  { target: '0xa27a69Ae180e202fDe5D38189a3F24Fe24E55861', fromBlock: 21488190, key: 'usr-counter' }, // USR Counter
  { target: '0xc7ab90c2ea9271efb31f5fa2843eeb4b331eafa0', fromBlock: 21488171, key: 'rlp-counter' }, // RLP Counter
]

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const [
        mintCreatedLogs, mintCancelledLogs, burnLogs,
        swapCreatedLogs, swapCancelledLogs,
      ] = await Promise.all([
        Promise.all(managers.map(m => getLogs({ api, target: m.target, eventAbi: eventAbis.mintCreated, onlyArgs: true, fromBlock: m.fromBlock, extraKey: m.key + '-created' }))),
        Promise.all(managers.map(m => getLogs({ api, target: m.target, eventAbi: eventAbis.mintCancelled, onlyArgs: true, fromBlock: m.fromBlock, extraKey: m.key + '-cancelled' }))),
        Promise.all(managers.map(m => getLogs({ api, target: m.target, eventAbi: eventAbis.burnCompleted, onlyArgs: true, fromBlock: m.fromBlock, extraKey: m.key + '-burn' }))),
        Promise.all(counters.map(c => getLogs({ api, target: c.target, eventAbi: eventAbis.swapCreated, onlyArgs: true, fromBlock: c.fromBlock, extraKey: c.key + '-created' }))),
        Promise.all(counters.map(c => getLogs({ api, target: c.target, eventAbi: eventAbis.swapCancelled, onlyArgs: true, fromBlock: c.fromBlock, extraKey: c.key + '-cancelled' }))),
      ])

      // Manager deposits: MintRequestCreated minus cancelled
      managers.forEach((_, i) => {
        const cancelledIds = new Set(mintCancelledLogs[i].map(log => log[0].toString()))
        for (const log of mintCreatedLogs[i]) {
          if (cancelledIds.has(log[0].toString())) continue
          if (!stables.has(log[2].toLowerCase())) continue
          api.add(log[2], log[3]) // depositToken, amount
        }
      })

      // Counter deposits: SwapRequestCreated minus cancelled
      counters.forEach((_, i) => {
        const cancelledIds = new Set(swapCancelledLogs[i].map(log => log[0].toString()))
        for (const log of swapCreatedLogs[i]) {
          if (cancelledIds.has(log[0].toString())) continue
          if (!stables.has(log[2].toLowerCase())) continue
          api.add(log[2], log[3]) // token, amount
        }
      })

      // Withdrawals: subtract USDC (BurnRequestCompleted withdrawalAmount is 6-dec stablecoin)
      // withdrawalAmount (6-dec) must be smaller than burnedAmount (18-dec) in normal operations
      for (const logs of burnLogs) {
        for (const log of logs) {
          if (log[2] * 1000000n > log[1]) continue
          api.add(USDC, -log[2])
        }
      }
    },
    staking: staking('0xFE4BCE4b3949c35fB17691D8b03c3caDBE2E5E23', '0x259338656198eC7A76c729514D3CB45Dfbf768A1'),
  }
}
