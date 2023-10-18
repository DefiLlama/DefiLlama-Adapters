const { yieldHelper, } = require("../helper/yieldHelper")
const { mergeExports } = require("../helper/utils")
const vault = '0x0fe9dB37CDB07cda112567EC9a6ba792dF9e3015'
const syn = '0xD0D07097c67fEAB7B79c79959AeEC30766515f10'
const abis ={
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256, uint256, uint256, uint256, uint256, uint256, uint256 amount, uint256, address strat)',
    poolLength: 'function poolLength() view returns (uint256)',
    getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)',
}
const syncyield = yieldHelper({
    project: 'syncyield-finance',
    chain: 'era',
    masterchef: vault,
    nativeToken: syn,
    abis,
  })
module.exports = mergeExports([syncyield])  

