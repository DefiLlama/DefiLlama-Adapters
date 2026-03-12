const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const staticPoolStableToken = ADDRESSES.bsc.USDT //usdt
const staticPool = "0x2b9C1F069Ddcd873275B3363986081bDA94A3aA3" // sigma staticPool
const sy = "0x8B98563d66B74e5a644BFf78fC72c86bbA847a29" // sigma token 1:1 slisBNB
const poolManager = "0x0a43ca87954ED1799b7b072F6E9D51d88Cca600E"
const longPool = '0x31c464Cfe506d44CEaA86C05CDBB94b5c94f70fb' // WBNB long pool 
const longPoolToken = ADDRESSES.bsc.WBNB // WBNB

// The new curve pool's TVL
// bnbUSD is a stablecoin launched by Sigma, with a 1:1 ratio to USDT.
// SigmaBnbUSDCurveLP is the Curve LP token for the Sigma/bnbUSD pool, and USDTBnbUSDCurveLP is the Curve LP token for the USDT/bnbUSD pool.
const SigmaBnbUSDCurveLP = '0xB84637aB9Be835580821A67823f414FFd0bbf625' // Curve TwoCrypto (SIGMA/bnbUSD)
const USDTBnbUSDCurveLP = '0xE6e2905F54BAF7625F4943B74c50338362741Cd4' // Curve StableSwap NG (USDT/bnbUSD)
// The gauges for the above Curve LP tokens
const SigmaBnbUSDCurveLPGauge = '0xeca91be20b9c944b52648b39ff8c250ac10a9882'
const USDTBnbUSDCurveLPGauge = '0x7223dd9cd88d5906fbf8336854a9982c8cd02434'

module.exports = {
  doublecounted: true,
  bsc: {
    tvl: async (api) => {
      const stableTotal = await api.call({ target: staticPool, abi: "uint256:totalStableToken" })
      api.add(staticPoolStableToken, stableTotal)
      const rawColls = await api.call({ target: longPool, abi: "uint256:getTotalRawCollaterals" })
      api.add(longPoolToken, rawColls)
      // Add the Curve LP tokens in the gauges
      // Call `totalSupply()` on each Gauge contract to retrieve the total quantity of staked LP tokens:
      const sigmaBnbUsdGaugeBalance = await api.call({ target: SigmaBnbUSDCurveLPGauge, abi: "uint256:totalSupply" })
      api.add(SigmaBnbUSDCurveLP, sigmaBnbUsdGaugeBalance)
      const usdtBnbUsdGaugeBalance = await api.call({ target: USDTBnbUSDCurveLPGauge, abi: "uint256:totalSupply" })
      api.add(USDTBnbUSDCurveLP, usdtBnbUsdGaugeBalance)

      await sumTokens2({ api, owners: [poolManager], tokens: [sy] })
    }
  },
};