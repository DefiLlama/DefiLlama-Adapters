const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports, getStakedEthTVL } = require('../helper/utils');

const GLM = "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429";
const withdrawalAddress = '0xba1951dF0C0A52af23857c5ab48B4C43A57E7ed1' // receives the staking rewards of the Foundation's validators

module.exports = mergeExports([
  treasuryExports({
    ethereum: {
      tokens: [nullAddress, ADDRESSES.ethereum.WETH],
      owners: [withdrawalAddress, '0x70a0a7be87deb51e1fab16d4f2bf00be1510e476', '0x3d4530082c3eb60f58af03f79b1ed3f40e591cd1'],
      ownTokens: [GLM],
    },
  }),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddress, proxy: true }) } },
])

module.exports.methodology = "ETH, WETH and GLM held by the Golem Foundation wallets, plus the ETH staked in its validators (withdrawal address 0xba1951dF0C0A52af23857c5ab48B4C43A57E7ed1)."
