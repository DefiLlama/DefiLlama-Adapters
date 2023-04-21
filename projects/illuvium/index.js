const { api } = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { staking } = require("../helper/staking")

const ILV_POOL_V2_ADDRESS = "0x7f5f854FfB6b7701540a00C69c4AB2De2B34291D"
const ILV_CORE_POOL = "0x25121EDDf746c884ddE4619b573A7B10714E2a36"
const ILV_TOKEN_ADDRESS = "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E"
const SLP_TOKEN_ADDRESS = "0x6a091a3406E0073C3CD6340122143009aDac0EDa"
const LP_POOL_V1_ADDRESS = "0x8B4d8443a0229349A9892D4F7CbE89eF5f843F72"
const LP_POOL_V2_ADDRESS = "0xe98477bDc16126bB0877c6e3882e3Edd72571Cc2"

async function tvl() {
  const [{ output: ilvPoolTvl }, { output: lpPoolLpBalance }, { output: lpPoolV1LpBalance }] = await Promise.all([
    // ILVPool
    api.abi.call({
      abi: "function getTotalReserves() view returns (uint256 totalReserves)",
      target: ILV_POOL_V2_ADDRESS,
    }),
    // SushiLPPool
    api.erc20.balanceOf({
      owner: LP_POOL_V2_ADDRESS,
      target: SLP_TOKEN_ADDRESS,
    }),
    api.erc20.balanceOf({
      owner: LP_POOL_V1_ADDRESS,
      target: SLP_TOKEN_ADDRESS,
    })
  ])

  return {
    [ILV_TOKEN_ADDRESS]: new BigNumber(ilvPoolTvl),
    [SLP_TOKEN_ADDRESS]: new BigNumber(lpPoolLpBalance).plus(lpPoolV1LpBalance),
  }
}

module.exports = {
  methodology: `Based on ILV reserves in the ILVPool contract and SLP in SushiLPPool contracts.`,
  ethereum:{
    tvl: () => 0,
    pool2: staking([LP_POOL_V1_ADDRESS, LP_POOL_V2_ADDRESS], SLP_TOKEN_ADDRESS),
    staking: staking([ILV_POOL_V2_ADDRESS, ILV_CORE_POOL,], ILV_TOKEN_ADDRESS),
  },
}