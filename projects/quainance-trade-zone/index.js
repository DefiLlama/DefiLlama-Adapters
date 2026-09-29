const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Quainance Trade Zone: bonding-curve launchpad on Quai.
// CurveLauncher (0x002658af3D4a4D0366c5AB997630211a818Ab923) creates a token, a curve market through
// CurveMarketFactory and a graduated AMM pair through the ReserveV2.1 factory in the same tx.
// While a token is on its curve the QUAI paid in sits as native balance in its market contract; on
// graduation the reserve moves into the pre-announced AMM pair. Contracts are unverified, so the two
// creation events are matched by topic hash and decoded by position:
//   CurveMarketFactory topic 0xcf64...: (address indexed token, address indexed market, address indexed creator)
//   ReserveFactory     topic 0x1808...: (address indexed tokenA, address indexed tokenB, address indexed launcher), data: (address pair, bytes32 salt)
//
const CURVE_MARKET_FACTORY = '0x00502f21296BbD3493d892557d5263eED7549d54'
const RESERVE_FACTORY = '0x004658A54bFb73Db3cFDc40b0e087dbD9ab1A9A3'
const MARKET_CREATED_TOPIC = '0xcf641095d42423e23e7feb54a56a5cc73fe8ff214824187d0450fc4245af5240'
const PAIR_CREATED_TOPIC = '0x18088035bfc482f03b1f5cc12477bdc58da20156589fccce3984985847ee1e0a'
const FROM_BLOCK = 9910000 // first launch at block 9910072

const topicToAddress = (t) => '0x' + t.slice(26)

async function tvl(api) {
  const marketLogs = await getLogs({ api, target: CURVE_MARKET_FACTORY, topics: [MARKET_CREATED_TOPIC], fromBlock: FROM_BLOCK, extraKey: 'MarketCreated' })
  const pairLogs = await getLogs({ api, target: RESERVE_FACTORY, topics: [PAIR_CREATED_TOPIC], fromBlock: FROM_BLOCK, extraKey: 'PairCreated' })
  const markets = marketLogs.map((l) => topicToAddress(l.topics[2]))
  const pairs = pairLogs.map((l) => '0x' + l.data.slice(26, 66))
  return sumTokens2({ api, owners: [...markets, ...pairs], tokens: [nullAddress, ADDRESSES.quai.WQUAI] })
}

module.exports = {
  methodology:
    'Counts the QUAI (native and WQUAI) held by Quainance Trade Zone bonding-curve markets and by the AMM pairs tokens graduate into, discovered from the market and reserve factory creation events. Launched tokens themselves are not counted.',
  start: '2026-09-03', // first launch, block 9910072
  quai: { tvl },
}
