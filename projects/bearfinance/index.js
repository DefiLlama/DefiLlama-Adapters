const { masterchefExports } = require('../helper/unknownTokens')

const BEAR_DAI_LP = "0x9e5719236e2ce62dc286ac89ae5a0fa142ae3aa8"
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f';


module.exports = masterchefExports({
  chain: 'fantom',
  useDefaultCoreAssets: true,
  masterchef: "0x16a06259725e4c7dFcE648f24D3443AfB96Aa0e5",
  nativeToken: "0x3b1a7770A8c97dCB21c18a2E18D60eF1B01d6DeC",
	poolInfoABI: {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accBearPerShare","type":"uint256"}],"stateMutability":"view","type":"function"}
})

module.exports.deadFrom = 1648765747