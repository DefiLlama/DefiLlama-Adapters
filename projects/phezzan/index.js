const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')

async function offers() {
  const markets = await get('https://api.phezzan.xyz/api/v1/markets')
  const marketInfos = await get('https://api.phezzan.xyz/api/v1/marketinfos?chain_id=280&market=' + Object.keys(markets).join(','))
  let total = 100
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
    usdc: "0x07218A117724e015E442BF81C66Cc331141A4A85",
    perpV1Result: "0x46bC4858F5BEE5AeB09bEB5906D7eFE92Ba50851",
    fundingResult: "0xDe7570E5835B6045C6AB360222887bAED21Be5EA", // Funding
    P1P1TradeResult: "0x49Ef8ca9A80B701E470EB70C835b361a99091278", // Staking
    P1LiquidationResult: "0x55B5134A843b75Ad0b968782788b32dA23d9AeDA" // LPs
  },
};

module.exports = {
    kava: {
        tvl: sumTokensExport({ owner: Contracts.kava.perpV1Result, tokens: [Contracts.kava.wkava, Contracts.kava.usdc, nullAddress] }),
        staking: sumTokensExport({ owner: Contracts.kava.fundingResult, tokens: [Contracts.kava.wkava]}),
    },
    zksync: {
        offers,
        tvl: async () => ({})
    }
};
