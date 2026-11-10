const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// IndexfyFolioFactory on Base: every Indexfy index (a Reserve Folio) is deployed through it
const FACTORY = '0xf6e0F9eB258F3201738b5ced92beA1ef44F9C497'
const FROM_BLOCK = 52828011

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    eventAbi: 'event FolioDeployed(address indexed creator, address indexed timelock, address indexed folio)',
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  })
  const allFolios = logs.map((log) => log.folio)
  // skip fully redeemed indexes: a cheap totalSupply read instead of the basket read.
  // Every address comes from the factory's own events, so a failed read is an error, not an empty index.
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: allFolios })
  const folios = allFolios.filter((_, i) => BigInt(supplies[i]) > 0n)
  // the basket tokens of each index, then each index's balance of them
  const baskets = await api.multiCall({
    abi: 'function totalAssets() view returns (address[] _assets, uint256[] _amounts)',
    calls: folios,
  })
  const tokensAndOwners = folios.flatMap((folio, i) => baskets[i]._assets.map((token) => [token, folio]))
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'TVL is the value of the basket tokens held by every index token deployed through the IndexfyFolioFactory on Base.',
  base: { tvl },
}
