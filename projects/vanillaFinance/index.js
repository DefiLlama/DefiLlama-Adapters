const addresses = {
  bsc: {
    MoneyVault: '0x994B9a6c85E89c42Ea7cC14D42afdf2eA68b72F1',
    MarketMakerVault: '0xaAd5005D2EF036d0a8b0Ab5322c852e55d9236cF',
    assetId: '0x55d398326f99059fF775485246999027B3197955',
  },
}

async function tvl(api) {
  return api.sumTokens({ owners: [addresses.bsc.MoneyVault, addresses.bsc.MarketMakerVault], tokens: [addresses.bsc.assetId] })
}

module.exports = {
  'bsc': {
    tvl,
  },
};