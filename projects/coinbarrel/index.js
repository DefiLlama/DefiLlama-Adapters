const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  robinhood: {
    v4: {
      positionManager: '0x58daec3116aae6d93017baaea7749052e8a04fa7', // Uniswap V4 PositionManager
      stateView: '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b',       // Uniswap V4 StateView
      custody: '0x418ece71c4ece08b71db8c53d59b6bc345efc659',         // PermanentV4PositionCustody
      fromBlock: 11467067,                                            // custody deployment (2026-07-16)
      quoteAssets: [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG],
    },
    v3: {
      nftManager: '0x73991a25c818bf1f1128deaab1492d45638de0d3',      // Uniswap V3 NonfungiblePositionManager
      custody: '0x0e88ba639f062feaa5f36a8d5f689d3e93bce593',         // PermanentV3PositionCustody
      quoteAssets: [ADDRESSES.robinhood.WETH],
    },
  },
}

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const TRANSFER_EVENT = 'event Transfer(address indexed from, address indexed to, uint256 indexed id)'

function padAddress(address) {
  return '0x' + address.toLowerCase().replace('0x', '').padStart(64, '0')
}

async function tvl(api) {
  const { v4, v3 } = config[api.chain]

  // 1. Uniswap V4 positions locked in the permanent custody (hook generations 1-5).
  const transfers = await getLogs2({
    api,
    target: v4.positionManager,
    eventAbi: TRANSFER_EVENT,
    topics: [TRANSFER_TOPIC, null, padAddress(v4.custody)],
    fromBlock: v4.fromBlock,
    extraKey: 'coinbarrel-custody',
  })
  const candidateIds = [...new Set(transfers.map((log) => log.id.toString()))]

  if (candidateIds.length) {
    const owners = await api.multiCall({
      target: v4.positionManager,
      abi: 'function ownerOf(uint256 tokenId) view returns (address)',
      calls: candidateIds,
      permitFailure: true,
    })
    const positionIds = candidateIds.filter((_, i) => owners[i]?.toLowerCase() === v4.custody)

    if (positionIds.length) {
      await sumTokens2({
        api,
        resolveUniV4: true,
        uniV4ExtraConfig: {
          positionIds,
          nftAddress: v4.positionManager,
          stateViewer: v4.stateView,
          whitelistedTokens: v4.quoteAssets,
        },
      })
    }
  }

  // 2. Legacy Simple launches: Uniswap V3 positions locked in the V3 custody.
  return sumTokens2({
    api,
    owner: v3.custody,
    resolveUniV3: true,
    uniV3ExtraConfig: { nftAddress: v3.nftManager },
    uniV3WhitelistedTokens: v3.quoteAssets,
  })
}

module.exports = {
  methodology:
    'Quote-asset side (ETH, WETH, USDG) of the Uniswap V4 launch positions permanently held by Coinbarrel\'s ownerless custody contract, enumerated on-chain from PositionManager Transfer events into the custody and re-verified with ownerOf, plus the WETH side of legacy Uniswap V3 launch positions held by the V3 custody. Launched tokens are excluded to avoid circular pricing. Marked doublecounted because these positions already sit inside Uniswap V4 and Uniswap V3 TVL on Robinhood Chain.',
  start: '2026-07-13', // first Coinbarrel launcher deployed on Robinhood Chain (block 8955028)
  doublecounted: true, // positions live in Uniswap V4 / V3 pools counted by the Uniswap listings
  hallmarks: [
    ['2026-07-28', 'Hook V5 generation live (unified launcher on Uniswap V4)'],
  ],
  robinhood: { tvl },
}
