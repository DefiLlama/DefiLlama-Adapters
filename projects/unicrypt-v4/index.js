const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getCoreAssets } = require('../helper/tokenMapping')

const lockIdScanLimit = 1000
const locksAbi = 'function locks(uint256) view returns (uint256 id, address owner, uint256 tokenId, tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 amount, uint256 unlockTime, address collectAddress, bool isNFTized, uint256 collectFee)'

const polygonUniV4Config = {
  nftAddress: '0x1ec2ebf4f37e7363fdfe3551602425af0b3ceef9',
  stateViewer: '0x5ea1bd7974c8a611cbab0bdcafcb1d9cc9b3ba5a',
}

const config = {
  ethereum: {
    nftAddress: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e',
    lockers: [
      '0x147aeca171a79466fe9e2c03f21b45155ff403f8',
      '0x30529ac67d5ac5f33a4e7fe533149a567451f023',
      '0x6a76da1eb2cbe8b0d52cfe122c4b7f0ca5a940ef',
    ],
  },
  bsc: {
    nftAddress: '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b',
    lockers: [
      '0x62d61d5695013a5aa29a628b83d91e240984b613',
      '0xd8c5bb7137021d93e70b7814c697bed303573b21',
      '0xa55d5ce984e9e933732cdf51095af8f3fb374ac8',
    ],
  },
  polygon: {
    nftAddress: polygonUniV4Config.nftAddress,
    lockers: [
      '0x1ec811ad6039e33b86458cdb267667af083261ed',
      '0x5cff5c8e4ab3ef911dbcfc6698663f5f471899d1',
    ],
    uniV4ExtraConfig: polygonUniV4Config,
  },
  arbitrum: {
    nftAddress: '0xd88f38f930b7952f2db2432cb002e7abbf3dd869',
    lockers: [
      '0x62d61d5695013a5aa29a628b83d91e240984b613',
      '0xfd52659dd221356e0f703cfa070c1213a0a1575b',
    ],
  },
  base: {
    nftAddress: '0x7c5f5a4bbd8fd63184577525326123b519429bdc',
    lockers: [
      '0x1ec811ad6039e33b86458cdb267667af083261ed',
      '0x1da374c9fa108e1f9d3c50e8e2ef2113eefae617',
      '0xd0cbff53620a345205750a14f03739806cffbd67',
      '0x610b43e981960b45f818a71cd14c91d35cda8502',
      '0xff908ded2a6c68226d3f834b25d803a815bdb28b',
    ],
  },
  unichain: {
    nftAddress: '0x4529a01c7a0410167c5740c487a8de60232617bf',
    lockers: [
      '0x6606b00eb636e1149cacc7f8d3d23d1638b36481',
      '0x52d6dbd7939e45094c1a3df563d9d8fc66943b91',
      '0xb08b965e966b5a042cfe64d5b5978ed1cb48b8a1',
    ],
  },
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  const { lockers, nftAddress, uniV4ExtraConfig = {} } = config[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      const whitelistedTokens = [...await getCoreAssets(api.chain), nullAddress]
      const positionIds = await getPositionIds({ api, lockers, nftAddress })

      if (positionIds.length) {
        await sumTokens2({
          api,
          resolveUniV4: true,
          uniV4ExtraConfig: { ...uniV4ExtraConfig, nftAddress, positionIds, whitelistedTokens },
        })
      }

      return api.getBalancesV2().clone(2).getBalances()
    },
  }
})

async function getPositionIds({ api, lockers, nftAddress }) {
  const positions = []

  for (const locker of lockers) {
    const locks = await api.multiCall({
      target: locker,
      abi: locksAbi,
      calls: Array.from({ length: lockIdScanLimit }, (_, i) => i),
      permitFailure: true,
    })

    locks.forEach(lock => {
      if (!lock || lock.owner.toLowerCase() === nullAddress) return
      positions.push({ id: lock.tokenId.toString(), locker })
    })
  }

  const ids = positions.map(position => position.id)
  if (!ids.length) return []

  const positionOwners = await api.multiCall({
    abi: 'function ownerOf(uint256) view returns (address)',
    calls: ids,
    target: nftAddress,
    permitFailure: true,
  })

  return ids.filter((_, i) => positionOwners[i]?.toLowerCase() === positions[i].locker.toLowerCase())
}
