const { staking } = require("../helper/staking");

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const KAVA_STAKING_CONTRACT = "0xD1cAf204721A02016993796663EDb00E6Ad9dac4"
const BSC_STAKING_CONTRACT = '0xEbD5a0bAED48747ea10feEB61a09a93550Fddcef'

const ammLpData = {
  arbitrum: {
    poolAddress: '0x0C36cB133CFF5D36313eFF3FF1761F9d391DF8Fc',
  },
  bsc: {
    poolAddress: '0x808A234665c7684A5e0Ed5e6BB551dBA1cc9d3e4',
  },
  polygon: {
    poolAddress: '0x2aDA82d11f6bC2bd357E7F3A6674983C372a50A3',
  }
}

module.exports = {
  methodology: "Ajira Pay Finance TVL Calculations are based on AJP Staking pool and Liquidity pool balances respectively on the AMMs",
  kava: {
    staking: staking(KAVA_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS),
    tvl: () => ({})
  },
  bsc: {
    staking: staking(BSC_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS),
    tvl: () => ({})
  },
  polygon: {
    tvl: () => ({}),
  },
  arbitrum: {
    tvl: () => ({}),
  }
};
