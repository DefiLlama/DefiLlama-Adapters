const v1abi = require('./v1Abi.json');

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
