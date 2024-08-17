const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

const LOOP_PRELAUNCH = "0xaBEEcB1d3414550B30694bB37ac24CAaD0b82aE9"

const tokens = {
  WETH: ADDRESSES.ethereum.WETH,
  weETH: "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee",
  ezETH: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
  rsETH: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
  rswETH: "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
  uniETH: "0xF1376bceF0f78459C0Ed0ba5ddce976F1ddF51F4",
  pufETH: "0xD9A442856C234a39a81a089C06451EBAa4306a72",
}

module.exports = {
  methodology:
    "Counts the number of WETH and LRT tokens in the LoopFi Prelaunch Contract.",
  start: 1718390875,
  ethereum: {
    tvl: sumTokensExport({
      owner: LOOP_PRELAUNCH,
      tokens: Object.values(tokens),
    }),
  },
}
