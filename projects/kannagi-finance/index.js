const abi = require("./abi.json");
const {yieldHelper} = require('../helper/yieldHelper');
const KANA_ADDRESS = "0x26aC1D9945f65392B8E4E6b895969b5c01A7B414";
const YIELD_ADDRESS= "0x6E415ba5a37761256D13E84B45f4822c179DEF47";
const USDT_ADDRESS = "era:0x493257fd37edb34451f62edf8d2a0c418852ba4c";


function yieldHelperWrapper(){
 const helperReturn =   yieldHelper({
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

const tvlFun = helperReturn.era.tvl;

const tvlFunWrapper =async function(_, _b, _cb, { api }){
  const tvlBalances =  await tvlFun(_, _b, _cb, { api })
  if(tvlBalances[USDT_ADDRESS]!=='0'&&tvlBalances[USDT_ADDRESS]!==undefined){
    let balance = (tvlBalances[USDT_ADDRESS])/1e6;
    tvlBalances["tether"] = balance;
    delete tvlBalances[USDT_ADDRESS];
  }
  return tvlBalances;
}
helperReturn.era.tvl = tvlFunWrapper

return helperReturn;
}

module.exports = yieldHelperWrapper()
