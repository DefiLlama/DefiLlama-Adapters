const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: { shop: '0x0c9fa52d7ed12a6316d3738c80931ecbc6c49907', },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const shop = config[chain].shop
      const posIds = await api.fetchList({ itemAbi: abi.openPositions, lengthAbi: abi.openPositionsSize, target: shop })
      const posData = await api.multiCall({ abi: abi.positions, calls: posIds, target: shop })
      const tokens = posData.map(pos => ([pos.collateral.collateralToken, pos.acquired.acquiredToken, pos.depositToken])).flat()
      return sumTokens2({ api, owner: shop, tokens, resolveUniV3: true, })
    }
  }
})

const abi = {
  "openPositions": "function openPositions(uint256) view returns (uint256)",
  "openPositionsSize": "uint256:openPositionsSize",
  "positions": "function positions(uint256) view returns (uint256 id, address borrower, address depositToken, uint256 depositAmount, bool open, uint256 minAuctionAmount, tuple(uint256 posDurationBlocks, uint256 posFee, uint256 createdBlock, uint256 createdTs) info, tuple(address collateralToken, uint8 collateralType, uint256 collateralAmount, uint256 collateralTokenId) collateral, tuple(address acquiredToken, uint256 acquiredAmount) acquired, tuple(address lender, uint256 posStartBlock, uint256 posStartTs, uint256 posEndTs) execution)",
}