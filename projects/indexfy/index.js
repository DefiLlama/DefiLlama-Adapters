const { getLogs } = require('../helper/cache/getLogs')

// IndexfyFolioFactory on Base: every Indexfy index (a Reserve Folio) is deployed through it
const FACTORY = '0xf6e0F9eB258F3201738b5ced92beA1ef44F9C497'
const FROM_BLOCK = 52828011

// Chainlink CCIP-bridged WBNB on Base has no price feed; value it as WBNB on BSC (both 18 decimals)
const TOKEN_MAPPING = {
  '0x740dc69e4d89f0ca67ccde0c543c252b90eacdbd': 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
}

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    eventAbi: 'event FolioDeployed(address indexed creator, address indexed timelock, address indexed folio)',
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  })
  const allFolios = logs.map((log) => log.folio)
  // skip fully redeemed indexes: a cheap totalSupply read instead of the basket read
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: allFolios, permitFailure: true })
  const folios = allFolios.filter((_, i) => supplies[i] && BigInt(supplies[i]) > 0n)
  const baskets = await api.multiCall({
    abi: 'function totalAssets() view returns (address[] _assets, uint256[] _amounts)',
    calls: folios,
    permitFailure: true,
  })
  baskets.forEach((basket) => {
    if (!basket) return
    basket._assets.forEach((asset, i) => {
      const mapped = TOKEN_MAPPING[asset.toLowerCase()]
      if (mapped) api.add(mapped, basket._amounts[i], { skipChain: true })
      else api.add(asset, basket._amounts[i])
    })
  })
}

module.exports = {
  methodology: 'TVL is the value of the basket tokens held by every index token deployed through the IndexfyFolioFactory on Base.',
  base: { tvl },
}
