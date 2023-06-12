const abi = require("./abi.json");
const {yieldHelper} = require('../helper/yieldHelper');
const KANA_ADDRESS = "0x26aC1D9945f65392B8E4E6b895969b5c01A7B414";
const YIELD_ADDRESS= "0x6E415ba5a37761256D13E84B45f4822c179DEF47";

module.exports = yieldHelper({
  project: 'kannagi-finance',
  chain: 'era',
  masterchef: YIELD_ADDRESS,
  nativeToken: KANA_ADDRESS,
  getPoolsFn: async (api) => api.call({ target: YIELD_ADDRESS, abi: abi.poolTvlInfo }),
  getTokenBalances: async ({ poolInfos }) => poolInfos.map(poolInfo => poolInfo.tvl),
  abis: {
    getReservesABI: abi.reserves,
  }
})
