const { yieldHelper, } = require("../helper/yieldHelper")

const masterchef = '0x6c8eE277A958751c97e8d0AFfEbbB8478bC755ce'
const froggy = '0x5217483171b2550C74234C583620C355b74b3095'

module.exports = yieldHelper({
  project: 'froggy-ink',
  chain: 'era',
  masterchef: masterchef,
  nativeToken: froggy,
  abis: {
    poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 , uint256 , uint256 , uint256 , uint256 , uint256 , uint256 amount, uint256 , address strat)',
    poolLength: 'function poolLength() view returns (uint256)',
    getReservesABI: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)',
  },
  useDefaultCoreAssets: true,
})

module.exports = {
  era: {
    tvl: () => ({}),
  },
  hallmarks: [
    [Math.floor(new Date('2023-06-15')/1e3), 'Rug Pull ?'],
  ],
}