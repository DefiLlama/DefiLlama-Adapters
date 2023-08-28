const { yieldHelper, } = require("../helper/yieldHelper")

const vault = '0xe798458bbE3282b38C8df1372a17E829927adACe'
const raccoon = '0x1299aA83ECa28D799349e9946D38C84D310b7450'

module.exports = yieldHelper({
  project: 'raccoon-finance',
  chain: 'base',
  masterchef: vault,
  nativeToken: raccoon,
  abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 , uint256 , uint256 , uint256 , uint256 , uint256 , uint256 amount, uint256 , address strat)',
    poolLength: 'function poolLength() view returns (uint256)',
    getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)',
  },
  useDefaultCoreAssets: true,
}),
module.exports.hallmarks = [
  [1693180800, "Rug Pull"]
]