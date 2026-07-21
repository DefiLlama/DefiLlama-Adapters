const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const V4_CL_POOL_MANAGER = '0xd79Cb76F783c332CeE7656243e136F94f43b6913'
const V4_VAULT = '0x8367cc5B351183f486E007DfEA712B909EdDCC12'
const V4_FROM_BLOCK = 141334571

// v2 pairs (previously tracked via registries/uniswapV2.js)
const v2Tvl = getUniTVL({
  factory: '0x105A0A9c1D9e29e0D68B746538895c94468108d2',
  useDefaultCoreAssets: true,
  hasStablePools: true,
})

// v4 CL pools: pool tokens are enumerated from CLPoolManager Initialize events,
// all funds are held in the Vault contract
async function v4Tvl(api) {
  // the sdk misclassifies injective as a cosmos chain when fetching the latest
  // block (the LCD endpoint it uses is deprecated), so we set the block
  // explicitly using the EVM RPC instead
  if (!api.block) api.block = (await api.provider.getBlockNumber()) - 20

  const logs = await getLogs2({
    api,
    target: V4_CL_POOL_MANAGER,
    fromBlock: V4_FROM_BLOCK,
    eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
  })

  const tokens = new Set()
  logs.forEach(log => {
    tokens.add(String(log.currency0).toLowerCase())
    tokens.add(String(log.currency1).toLowerCase())
  })

  return sumTokens2({ api, tokens: Array.from(tokens), owner: V4_VAULT, permitFailure: true })
}

module.exports = {
  methodology: 'TVL is the value of tokens locked in Pumex v2 liquidity pairs plus tokens held in the Pumex v4 concentrated liquidity Vault.',
  timetravel: false,
  injective: {
    tvl: sdk.util.sumChainTvls([v2Tvl, v4Tvl]),
  },
}
