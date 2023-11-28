const { yieldHelper, } = require("../helper/yieldHelper")
const { staking } = require('../helper/staking');
const vault = '0x1334843D688E54B37b7fC3a31F24d836ca31916B'
const STE = '0x6767f2f2D8C0A63A7a1B3Ad2Bb890FDc125Ccab7'
const abis ={
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256, uint256, uint256, uint256, uint256, uint256, uint256 amount, uint256, address strat)',
    getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)',
}
module.exports = yieldHelper({
  project: 'stellaris-finance',
  chain: 'scroll',
  masterchef: vault,
  nativeToken: STE,
  abis,
})
module.exports.scroll.staking = staking(["0x2AfbfC108f8da937e70601B0eD6710AE22f015e6", "0x2824408DeFaEC46548E8296Cf52a652E676f4af9"], STE)

