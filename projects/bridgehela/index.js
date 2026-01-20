const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner:'0x8094816e435b8ca77f2dfe240820c6c6ac784900', tokens: [ADDRESSES.ethereum.USDT,ADDRESSES.ethereum.USDC] })
  },
  bsc: {
    tvl: sumTokensExport({ owner:'0x8094816e435b8ca77f2dfe240820c6c6ac784900', tokens: [ADDRESSES.bsc.USDT,ADDRESSES.bsc.USDC] })
  },
  polygon: {
    tvl: sumTokensExport({ owner:'0x700d0c48926af78c2c51f08c667f27ce6548386b', tokens: [ADDRESSES.polygon.USDT,ADDRESSES.polygon.USDC] })
  },
  hela: {
    tvl: async (api) => {
      const totalSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: [ADDRESSES.hela.hUSDC,ADDRESSES.hela.hUSDT] })
      api.add(ADDRESSES.hela.hUSDC ,totalSupply[0])
      api.add(ADDRESSES.hela.hUSDT ,totalSupply[1])
    }
  }
}