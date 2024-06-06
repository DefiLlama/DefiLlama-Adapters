const ADDRESSES = require('../helper/coreAssets.json')
const { masterchefExports } = require('../helper/unknownTokens')

const BEAR_DAI_LP = "0x9e5719236e2ce62dc286ac89ae5a0fa142ae3aa8"
const DAI = ADDRESSES.ethereum.DAI;


module.exports = masterchefExports({
  chain: 'fantom',
  useDefaultCoreAssets: true,
  masterchef: "0x16a06259725e4c7dFcE648f24D3443AfB96Aa0e5",
  nativeToken: "0x3b1a7770A8c97dCB21c18a2E18D60eF1B01d6DeC",
	poolInfoABI: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBearPerShare)'
})

module.exports.deadFrom = 1648765747