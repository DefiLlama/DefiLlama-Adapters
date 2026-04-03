const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Sigma V1 TVL
const staticPoolStableToken = ADDRESSES.bsc.USDT //usdt
const staticPool = "0x2b9C1F069Ddcd873275B3363986081bDA94A3aA3" // sigma staticPool
const sy = "0x8B98563d66B74e5a644BFf78fC72c86bbA847a29" // sigma token 1:1 slisBNB
const poolManager = "0x0a43ca87954ED1799b7b072F6E9D51d88Cca600E"
const longPool = '0x31c464Cfe506d44CEaA86C05CDBB94b5c94f70fb' // WBNB long pool 
const longPoolToken = ADDRESSES.bsc.WBNB // WBNB

// Sigma V2 TVL
//
// 1. Staked amount of USDT in Stability Pool1(SP1)
const stabilityPool1 = "0xDe1bdd429692e12E60796AE02208B14Fd5EaCea7"
//
// 2. Staked amount of USDT in Stability Pool2(SP2)
const stabilityPool2 = "0x16D39a7a489DcBEB1EC6Da383F1D95a7b1754c94"
//
// 3. Staked amount of USDT in Stability Pool3(SP3)
const stabilityPool3 = "0x1a36aAf9946e38fc770E70878C83fa5EfE86a635"
//
// 4. Staked amount of SIGMA/bnbUSD LP (Curve pool SIGMA/bnbUSD) in Gauge
const SigmaBnbUSDCurveLP = "0xB84637aB9Be835580821A67823f414FFd0bbf625" // Curve TwoCrypto (SIGMA/bnbUSD)
const sigma_gauge_SIGMA_BNBUSD = "0xeca91be20b9c944b52648b39ff8c250ac10a9882"
//
// 5. Staked amount of USDT/bnbUSD LP (Curve pool USDT/bnbUSD) in Gauge
const USDTBnbUSDCurveLP = "0xE6e2905F54BAF7625F4943B74c50338362741Cd4" // Curve StableSwap NG (USDT/bnbUSD)
const sigma_gauge_USDTbnbUSD  = "0x7223dd9cd88d5906fbf8336854a9982c8cd02434"
//
// 6. Staked amount of bnbUSD/United Stables(U) LP (Curve pool bnbUSD/U) in Gauge
const BnbUSDUCurveLP = "0xed55ff3fcb43249838a04a9707ff2c4b825507ff" // Curve StableSwap NG (bnbUSD/U)
const sigma_gauge_BnbUSDU  = "0x04Bd5c408F2646d6fea8D3cB18A9a58FF305b2Ac"


module.exports = {
  doublecounted: true,
  bsc: {
    tvl: async (api) => {
      const totals = await api.multiCall({
        abi: "uint256:totalStableToken",
        calls: [staticPool, stabilityPool1, stabilityPool2, stabilityPool3],
      })
      totals.forEach(t => api.add(staticPoolStableToken, t))
    },
    pool2: async (api) => {
      const lpBalances = await api.multiCall({
        abi: "erc20:totalSupply",
        calls: [sigma_gauge_SIGMA_BNBUSD, sigma_gauge_USDTbnbUSD, sigma_gauge_BnbUSDU],
      })
      api.add(SigmaBnbUSDCurveLP, lpBalances[0])
      api.add(USDTBnbUSDCurveLP, lpBalances[1])
      api.add(BnbUSDUCurveLP, lpBalances[2])

      const rawColls = await api.call({ target: longPool, abi: "uint256:getTotalRawCollaterals" })
      api.add(longPoolToken, rawColls)
      await sumTokens2({ api, owners: [poolManager], tokens: [sy] })
    }
  },
};
