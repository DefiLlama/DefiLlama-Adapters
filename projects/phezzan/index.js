const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')

async function offers() {
  const markets = await get('https://api.phezzan.xyz/api/v1/markets')
  const marketInfos = await get('https://api.phezzan.xyz/api/v1/marketinfos?chain_id=280&market=' + Object.keys(markets).join(','))
  let total = 1000
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
    wkava: ADDRESSES.kava.WKAVA,
    usdc: ADDRESSES.telos.ETH,
    perpV1Result: "0x46bC4858F5BEE5AeB09bEB5906D7eFE92Ba50851",
    fundingResult: "0xDe7570E5835B6045C6AB360222887bAED21Be5EA", // Funding
    P1P1TradeResult: "0x49Ef8ca9A80B701E470EB70C835b361a99091278", // Staking
    P1LiquidationResult: "0x55B5134A843b75Ad0b968782788b32dA23d9AeDA" // LPs
  },
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
    kava: {
      tvl: async () => ({}),
        // tvl: sumTokensExport({ owners: [Contracts.kava.perpV1Result, Contracts.kava.fundingResult, ], tokens: [Contracts.kava.wkava, Contracts.kava.usdc, nullAddress] }),
    },
    zksync: {
        // offers,
        tvl: async () => ({})
    },
    hallmarks: [
      [Math.floor(new Date('2023-04-23')/1e3), 'Protocol shutdown'],
    ],
};
