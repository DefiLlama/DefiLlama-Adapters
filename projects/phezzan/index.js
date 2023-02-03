const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')

async function offers() {
  const markets = await get('https://api.phezzan.xyz/api/v1/markets')
  const marketInfos = await get('https://api.phezzan.xyz/api/v1/marketinfos?chain_id=280&market=' + Object.keys(markets).join(','))
  let total = 0
  Object.keys(markets).forEach(market => {
    const info = marketInfos[market]
    const { baseVolume, quoteVolume } = markets[market]
    if (!info)  return;
    total += baseVolume * info.baseAsset.usdPrice + quoteVolume * info.quoteAsset.usdPrice
  })
  return toUSDTBalances(total)
}


const Contracts = {
  kava: {
    wkava: "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
    perpV1Result: "0xA7a0fdB7b47d4572BDe8B74895Fbc2C69B07bA7c",
    fundingResult: "0xDe7570E5835B6045C6AB360222887bAED21Be5EA", // Funding
    P1P1TradeResult: "0x49Ef8ca9A80B701E470EB70C835b361a99091278", // Staking
    P1LiquidationResult: "0x55B5134A843b75Ad0b968782788b32dA23d9AeDA" // LPs
  },
};

module.exports = {
    kava: {
        tvl: sumTokensExport({ owner: Contracts.kava.perpV1Result, tokens: [Contracts.kava.wkava, nullAddress] }),
        staking: sumTokensExport({ owner: Contracts.kava.fundingResult, tokens: [Contracts.kava.wkava]}),
    },
    zksync: {
        offers,
        tvl: async () => ({})
    }
};
