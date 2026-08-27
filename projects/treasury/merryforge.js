const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const LAUNCH_FACTORY = '0x3b5e8FE8d61B00b35e021275c96F754424b1B9A8'
const FEE_VAULT = '0x8963d65670838ac4b728A049416BDEc89d6cC776'

const USDG = ADDRESSES.robinhood.USDG
const WETH = ADDRESSES.robinhood.WETH
const VIRTUAL = '0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31'

// first-wave Stock Token native-raise quotes
const STOCK_NATIVE_RAISE = [
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0xe93237C50D904957Cf27E7B1133b510C669c2e74', // MSFT
]

const QUOTES = [USDG, WETH, VIRTUAL, ...STOCK_NATIVE_RAISE]

async function tvl(api) {
  const owners = [FEE_VAULT]

  const treasury = await api.call({ target: LAUNCH_FACTORY, abi: 'address:protocolTreasury' })
  if (treasury && treasury !== ADDRESSES.null) owners.push(treasury)

  return sumTokens2({ api, owners, tokens: QUOTES })
}

module.exports = {
  methodology:
    'Tracks quote-asset balances in the FeeVault and in the protocolTreasury (create-fee revenue).',
  robinhood: { tvl },
}
