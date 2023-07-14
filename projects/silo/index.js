const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const getAssetsAbi = "address[]:getAssets"

const getAssetStateAbi = 'function getAssetsWithState() view returns (address[] assets, tuple(address collateralToken, address collateralOnlyToken, address debtToken, uint256 totalDeposits, uint256 collateralOnlyDeposits, uint256 totalBorrowAmount)[] assetsStorage)'

const config = {
  ethereum: {
    START_BLOCK: 15307294,
    SILO_FACTORY: '0x4D919CEcfD4793c0D47866C8d0a02a0950737589',
  },
  arbitrum: {
    START_BLOCK: 51894508,
    SILO_FACTORY: '0x4166487056A922D784b073d4d928a516B074b719',
  },
}

const XAI = '0xd7c9f0e536dc865ae858b0c0453fe76d13c3beac'
const fallbackBlacklist = ["0x6543ee07cf5dd7ad17aeecf22ba75860ef3bbaaa",];

async function tvl(_, block, _1, { api }) {
  const siloArray = await getSilos(api)
  const assets = await api.multiCall({
    abi: getAssetsAbi,
    calls: siloArray,
  })

  const toa = assets.map((v, i) => ([v, siloArray[i]]))
  return sumTokens2({ api, ownerTokens: toa, blacklistedTokens: [XAI], })
}

async function borrowed(_, block, _1, { api }) {
  const siloArray = await getSilos(api)
  const assetStates = await api.multiCall({
    abi: getAssetStateAbi,
    calls: siloArray.map(i => ({ target: i })),
  });
  assetStates.forEach(({ assets, assetsStorage }) => {
    assetsStorage
      .forEach((i, j) => {
        if (assets[j].toLowerCase() === XAI) return;
        return api.add(assets[j], i.totalBorrowAmount)
      })
  })
}

async function getSilos(api) {
  const chain = api.chain
  const { SILO_FACTORY, START_BLOCK, } = config[chain]
  const logs = (
    await getLogs({
      api,
      target: SILO_FACTORY,
      fromBlock: START_BLOCK,
      topic: 'NewSiloCreated(address,address,uint128)',
    })
  )

  return logs.map((log) => `0x${log.topics[1].substring(26)}`).filter((address) => fallbackBlacklist.indexOf(address.toLowerCase()) === -1);
}


module.exports = {
  ethereum: { tvl, borrowed, },
  arbitrum: { tvl, borrowed, },
  hallmarks: [
    [1668816000, "XAI Genesis"]
  ]
}