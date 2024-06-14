const { getLogs } = require('./helper/cache/getLogs')
const { sumTokens2 } = require('./helper/unwrapLPs')
const { isArtBlocks } = require('./helper/nft')

async function tvl(api) {
  const factory = '0x85aa7f78bdb2de8f3e0c0010d99ad5853ffcfc63'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0xf9c32fbc56ff04f32a233ebc26e388564223745e28abd8d0781dd906537f563e'],
    eventAbi: 'event Mint (address indexed token, uint256 id, uint256 price, address vault, uint256 vaultId)',
    onlyArgs: true,
    fromBlock: 12743932,
  })
  const artBlockOwners = []
  const tokensAndOwners = logs.map(log => [log.token, log.vault]).filter(([token, vault]) => {
    if (isArtBlocks(token)) {
      artBlockOwners.push(vault)
      return false
    }
    return true
  })

  await sumTokens2({ api, owners: artBlockOwners, resolveArtBlocks: true, })

  return sumTokens2({
    api, tokensAndOwners, blacklistedTokens: [
      '0x9ef27de616154ff8b38893c59522b69c7ba8a81c',
      '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    ]
  })
}
async function tvlLPDA(api) {
  const factory = '0x32e8ab1e243d8d912a5ae937635e07e7e451d2ae'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x4a08e09eb1f4b221a4d4faff944c52d3bb85486dd0f7e647977d35b406e16e43'],
    eventAbi: 'event CreatedLPDA(address indexed vault, address indexed token, uint256 _id, tuple(uint32 startTime, uint32 endTime, uint64 dropPerSecond, uint128 startPrice, uint128 endPrice, uint128 minBid, uint16 supply, uint16 numSold, uint128 curatorClaimed, address curator) _lpdaInfo)',
    onlyArgs: true,
    fromBlock: 16125170,
  })
  
  return sumTokens2({
    api, tokensAndOwners: logs.map(log => [log.token, log.vault]), blacklistedTokens: [
      '0x9ef27de616154ff8b38893c59522b69c7ba8a81c',
    ],
  })
}

module.exports = {
  ethereum: { tvl: tvl },
  methodology: `TVL is value of nfts in the vaults`
}


