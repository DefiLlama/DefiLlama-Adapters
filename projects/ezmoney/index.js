const { PANCAKE_NFT_ADDRESS, unwrapSlipstreamNFT, unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

const listUserPositionKeys = 'function listUserPositionKeys(address user) view returns (bytes32[])'
const positions = 'function positions(bytes32) view returns (address owner,uint256 tokenId,address token0,address token1,uint24 fee,int24 tickSpacing,int24 tickLower,int24 tickUpper,uint256 totalDepositedUSDC,uint256 dustUSDC,bool botAllowed,uint48 openedAt,address dex,address pool)'

const config = {
  base: {
    clCore: '0x61c36AFF32Be348a3D1FE1E2B4745048f652770F',
    wrapper: '0x180670ccB476624566E78618D467Ef57EBBf1921',
    dexes: {
      '0x0e5d5ADE8E9f5ddc2df1CAeBc63EA37c1fC5be3B': {
        type: 'uniV3',
        nftAddress: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
      },
      '0x6e08CAb6ebB204aC7473aFdb09C6e914f4B4f749': {
        type: 'uniV3',
        nftAddress: PANCAKE_NFT_ADDRESS,
      },
      '0x9EfDe1640231A5306304317649f548bE73A5FA28': {
        type: 'slipstream',
        nftAddress: '0x827922686190790b37229fd06084350e74485b72',
      },
    },
  },
  arbitrum: {
    clCore: '0xD52170Ae01B9198246842D9a4Ad964AcD786ae91',
    wrapper: '0x91d0acacb9979e2332D05d370ff94e676516c449',
    dexes: {
      '0xC0Fac58F632B4BE80e9C040134cB6867B0F6FC1D': {
        type: 'uniV3',
        nftAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
      },
    },
  },
  bsc: {
    clCore: '0x10c6d38F0c19c09b7cEFDE5F42494e4FECA08EB2',
    wrapper: '0xFDBEb935E2097d9fDFf27A73F89b1890e681D48d',
    dexes: {
      '0xaebfc272E575Cf38721c30a60A018c6de49CFd3f': {
        type: 'uniV3',
        nftAddress: PANCAKE_NFT_ADDRESS,
      },
    },
  },
  hyperliquid: {
    clCore: '0x6F81790Ebac25497be379Dc66143fb298663Ae11',
    wrapper: '0x5afEBF92e99ccb0b13215BEbE85daBC63f8eC338',
    dexes: {
      '0xc5cF6Bc5Db058B4330Ab3687BDaFc575f800CC0D': {
        type: 'uniV3',
        nftAddress: '0xead19ae861c29bbb2101e834922b2feee69b9091',
      },
    },
  },
}

function buildTvl(chainConfig) {
  return async (api) => {
    const keys = await api.call({ target: chainConfig.clCore, abi: listUserPositionKeys, params: [chainConfig.wrapper] })
    if (!keys.length) return api.getBalances()

    const dexes = Object.fromEntries(Object.entries(chainConfig.dexes).map(([dex, value]) => [dex.toLowerCase(), value]))
    const wrapper = chainConfig.wrapper.toLowerCase()
    const groups = {}

    const currentPositions = await api.multiCall({ target: chainConfig.clCore, abi: positions, calls: keys })
    currentPositions.forEach((position) => {
      if (position.owner.toLowerCase() !== wrapper) return
      if (position.tokenId.toString() === '0') return

      const dexConfig = dexes[position.dex.toLowerCase()]
      if (!dexConfig) throw new Error(`Missing EZMoney dex config for ${api.chain}: ${position.dex}`)

      const groupKey = `${dexConfig.type}:${dexConfig.nftAddress.toLowerCase()}`
      if (!groups[groupKey]) groups[groupKey] = { ...dexConfig, positionIds: [] }
      groups[groupKey].positionIds.push(position.tokenId)
    })

    for (const group of Object.values(groups)) {
      if (group.type === 'slipstream') {
        await unwrapSlipstreamNFT({ api, balances: api.getBalances(), nftAddress: group.nftAddress, positionIds: group.positionIds })
      } else {
        await unwrapUniswapV3NFT({ api, balances: api.getBalances(), nftAddress: group.nftAddress, uniV3ExtraConfig: { positionIds: group.positionIds } })
      }
    }

    return api.getBalances()
  }
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: buildTvl(config[chain]),
  }
})

module.exports.methodology = 'TVL is the sum of token amounts in active EZManager CLCore concentrated-liquidity positions whose CLCore position owner is the EZWrapper (EZMoney) contract, across Base, Arbitrum, BSC, and Hyperliquid.'
module.exports.doublecounted = true
