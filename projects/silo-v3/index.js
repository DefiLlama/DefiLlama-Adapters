const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
// Silo V3 deployments
const configV3 = {
  arbitrum: {
    factories: [
      {
        START_BLOCK: 435460074,
        SILO_FACTORY: '0xafd8f792cb025a76c4916652cfc8e20eee3b6fe2',
      },
    ],
  },
  avax: {
    factories: [
      {
        START_BLOCK: 78875406,
        SILO_FACTORY: '0x9e64f0cd206cce2da5de08e7f482d62f57013d0e',
      },
    ],
  },
  ethereum: {
    factories: [
      {
        START_BLOCK: 24527218,
        SILO_FACTORY: '0x1dab4a310447185144467076b116dac7aec3b48f',
      },
    ],
  },
  sonic: {
    factories: [
      {
        START_BLOCK: 63632954,
        SILO_FACTORY: '0xf81d90df1b63d48536e78564d24d5dd8f2be58ad',
      },
    ],
  },
  xdc: {
    factories: [
      {
        START_BLOCK: 100790923,
        SILO_FACTORY: '0xf81d90df1b63d48536e78564d24d5dd8f2be58ad',
      },
    ],
  },
  megaeth: {
    factories: [
      {
        START_BLOCK: 14488088,
        SILO_FACTORY: '0x95a7bc57c738c7f64103b93d04f49cbca566affd',
      },
    ],
  },
}

const methodology = [
  'Silo V3 addresses are retrieved from SiloFactory NewSilo() events.',
  'TVL is calculated as the balance of underlying assets across all deployed silos.',
  'It excludes borrowed assets and is equal to the sum of current liquidity and protected deposits.',
  'The total borrowed amount across all deployed silos, including accrued interest, obtained via the getDebtAssets() function'
].join(' ')

const getAssetAbi = 'address:asset'
const getDebtAssetsAbi = 'function getDebtAssets() external view returns (uint256 totalDebtAssets)'
const newSiloEvent = 'event NewSilo(address indexed implementation, address indexed token0, address indexed token1, address silo0, address silo1, address siloConfig)'

async function getSilos(api) {
  let siloAddresses = []
  if (!configV3[api.chain]) return siloAddresses

  for (const factory of configV3[api.chain].factories) {
    const { SILO_FACTORY, START_BLOCK } = factory

    const logChunk = await getLogs2({
      api,
      target: SILO_FACTORY,
      fromBlock: START_BLOCK,
      eventAbi: newSiloEvent,
    })

    for (const log of logChunk) {
      siloAddresses.push(log.silo0, log.silo1)
    }
  }

  return siloAddresses
}

async function tvl(api) {
  let ownerTokens = []
  if (configV3[api.chain]) {
    const silos = await getSilos(api)
    const assets = await api.multiCall({
      abi: getAssetAbi,
      calls: silos,
    })
    ownerTokens = assets.map((asset, i) => [[asset], silos[i]])
  }
  return sumTokens2({ api, ownerTokens })
}

async function borrowed(api) {
  if (!configV3[api.chain]) return
  const silos = await getSilos(api)
  const siloAssets = await api.multiCall({
    abi: getAssetAbi,
    calls: silos,
  })
  const borrowAmounts = await api.multiCall({
    abi: getDebtAssetsAbi,
    calls: silos,
  })
  siloAssets.forEach((asset, index) => {
    api.add(asset, borrowAmounts[index])
  })
}

module.exports = {
  methodology,
  arbitrum: { tvl, borrowed },
  avax: { tvl, borrowed },
  ethereum: { tvl, borrowed },
  sonic: { tvl, borrowed },
  xdc: { tvl, borrowed },
  megaeth: { tvl, borrowed },
}
