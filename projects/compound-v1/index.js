const v1abi = {
    "getCollateralMarketsLength": "uint256:getCollateralMarketsLength",
    "markets": "function markets(address) view returns (bool isSupported, uint256 blockNumber, address interestRateModel, uint256 totalSupply, uint256 supplyRateMantissa, uint256 supplyIndex, uint256 totalBorrows, uint256 borrowRateMantissa, uint256 borrowIndex)",
    "collateralMarkets": "function collateralMarkets(uint256) view returns (address)"
  };

const v1Contract = '0x3FDA67f7583380E67ef93072294a7fAc882FD7E7'
async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: v1abi.getCollateralMarketsLength, itemAbi: v1abi.collateralMarkets, target: v1Contract })
  return api.sumTokens({ owner: v1Contract, tokens })
}

async function borrowed(api) {
  const tokens = await api.fetchList({ lengthAbi: v1abi.getCollateralMarketsLength, itemAbi: v1abi.collateralMarkets, target: v1Contract })
  const markets = await api.multiCall({ abi: v1abi.markets, calls: tokens, target: v1Contract })
  const bals = markets.map(m => m.totalBorrows)
  api.add(tokens, bals)
}

module.exports = {
  ethereum: {
    tvl,
    borrowed
  },
};
