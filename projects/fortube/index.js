const abi = {
    "getCollateralMarketsLength": "uint256:getCollateralMarketsLength",
    "collateralTokens": "function collateralTokens(uint256) view returns (address)",
    "mkts": "function mkts(address) view returns (uint256 accrualBlockNumber, int256 supplyRate, int256 demondRate, address irm, uint256 totalSupply, uint256 supplyIndex, uint256 totalBorrows, uint256 borrowIndex, uint256 totalReserves, uint256 minPledgeRate, uint256 liquidationDiscount, uint256 decimals)",
    "underlying": "address:underlying",
    "getAllMarkets": "address[]:getAllMarkets",
    "APR": "uint256:APR",
    "APY": "uint256:APY",
    "totalBorrows": "uint256:totalBorrows"
  };
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

const ForTube = "0xE48BC2Ba0F2d2E140382d8B5C8f261a3d35Ed09C";
const ForTubeV2 = "0x936E6490eD786FD0e0f0C1b1e4E1540b9D41F9eF";

const config = {
  ethereum: '0x936E6490eD786FD0e0f0C1b1e4E1540b9D41F9eF',
  bsc: '0xc78248D676DeBB4597e88071D3d889eCA70E5469',
  okexchain: '0x33d6D5F813BF78163901b1e72Fb1fEB90E72fD72',
  iotex: '0xF8C5965BfBAE9c429F91BA357d930Ed78ffd4cF9',
  polygon: '0x4Ac2735652944FE5C3dD95807287643502e5dE51',
}

Object.keys(config).forEach(chain => {
  const owner = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const markets = await api.call({
        abi:  abi.getAllMarkets,
        target: owner,
      })
      const erc20AssetsV2 = await api.multiCall({
        abi:  abi.underlying,
        calls: markets,
      })
      const toa = erc20AssetsV2.map(i => ([i, owner]))
      toa.push([nullAddress, owner])

      if (chain === 'ethereum') {
        const erc20Assets = await api.fetchList({
          itemAbi: abi.collateralTokens,
          lengthAbi:  abi.getCollateralMarketsLength,
          target: ForTube,
        })
        toa.push([nullAddress, ForTube])
        erc20Assets.forEach(i => toa.push([i, ForTubeV2]))
      }
    
      return sumTokens2({ api, tokensAndOwners: toa })
    }
  }
})
